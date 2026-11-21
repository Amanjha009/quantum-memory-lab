"""Numerical flash-memory models; units are SI internally."""
from __future__ import annotations
import math
import numpy as np

HBAR = 1.054571817e-34
QE = 1.602176634e-19
ME = 9.1093837015e-31
KB = 1.380649e-23
FN_A = 1.541434e-6
FN_B = 6.83089e9
SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60


def oxide_field(gate_voltage_v, oxide_nm, coupling=0.72, offset_v=1.2):
    oxide_drop_v = max(0.0, coupling * (float(gate_voltage_v) - offset_v))
    field_vm = oxide_drop_v / max(0.1, float(oxide_nm)) * 1e9
    return {"oxideDropV": oxide_drop_v, "fieldVm": field_vm}


def fn_current_density(field_vm, barrier_ev=3.1):
    field = max(0.0, float(field_vm))
    barrier = max(0.1, float(barrier_ev))
    if not field:
        return 0.0
    exponent = min(745.0, FN_B * barrier**1.5 / field)
    return FN_A * field**2 / barrier * math.exp(-exponent)


def fn_charge_increment_fc(field_vm, barrier_ev=3.1, pulse_width_us=5.0, area_um2=0.02):
    current_density = fn_current_density(field_vm, barrier_ev)
    charge_c = current_density * max(0.0, float(area_um2)) * 1e-12 * max(0.0, float(pulse_width_us)) * 1e-6
    return {"currentDensity": current_density, "chargeC": charge_c, "chargeFc": charge_c * 1e15}


def cell_threshold_v(charge_fc, erased_vt_v=0.45, capacitance_ff=0.25):
    return float(erased_vt_v) + max(0.0, float(charge_fc)) / max(1e-6, float(capacitance_ff))


def ispp_program(initial_charge_fc=0.0, vpgm_start_v=14.0, vpgm_max_v=24.0, vpgm_step_v=0.5,
                 oxide_nm=9.0, barrier_ev=3.1, pulse_width_us=5.0, area_um2=0.02,
                 verify_vt_v=1.5, erased_vt_v=0.45, capacitance_ff=0.25,
                 coupling=0.72, offset_v=1.2, max_pulses=128):
    charge_fc = max(0.0, float(initial_charge_fc))
    start, maximum = max(0.0, float(vpgm_start_v)), max(float(vpgm_start_v), float(vpgm_max_v))
    step = max(0.05, float(vpgm_step_v))
    pulses = []
    index = 1
    voltage = start
    while voltage <= maximum + 1e-9 and index <= min(128, max(1, int(max_pulses))):
        field = oxide_field(voltage, oxide_nm, coupling, offset_v)
        current = fn_charge_increment_fc(field["fieldVm"], barrier_ev, pulse_width_us, area_um2)
        charge_fc += current["chargeFc"]
        vt_v = cell_threshold_v(charge_fc, erased_vt_v, capacitance_ff)
        verified = vt_v >= float(verify_vt_v)
        pulses.append({"index": index, "voltageV": voltage, **field, "currentDensity": current["currentDensity"],
                       "deltaChargeFc": current["chargeFc"], "chargeFc": charge_fc, "vtV": vt_v, "verified": verified})
        if verified:
            break
        index += 1
        voltage = start + (index - 1) * step
    return {"chargeFc": charge_fc, "vtV": cell_threshold_v(charge_fc, erased_vt_v, capacitance_ff),
            "verified": cell_threshold_v(charge_fc, erased_vt_v, capacitance_ff) >= float(verify_vt_v), "pulses": pulses}


def fn_erase(initial_charge_fc=0.0, erase_voltage_v=24.0, oxide_nm=9.0, barrier_ev=3.1,
             pulse_width_us=5.0, area_um2=0.02, erased_vt_v=0.45, capacitance_ff=0.25,
             coupling=0.72, offset_v=1.2, max_pulses=64):
    charge_fc = max(0.0, float(initial_charge_fc))
    field = oxide_field(abs(float(erase_voltage_v)), oxide_nm, coupling, offset_v)
    transfer = fn_charge_increment_fc(field["fieldVm"], barrier_ev, pulse_width_us, area_um2)
    pulses = []
    for index in range(1, min(64, max(1, int(max_pulses))) + 1):
        if charge_fc <= 1e-6:
            break
        removed = min(charge_fc, transfer["chargeFc"])
        charge_fc -= removed
        pulses.append({"index": index, "eraseVoltageV": -abs(float(erase_voltage_v)), **field,
                       "currentDensity": transfer["currentDensity"], "removedFc": removed,
                       "chargeFc": charge_fc, "vtV": cell_threshold_v(charge_fc, erased_vt_v, capacitance_ff)})
    return {"chargeFc": charge_fc, "vtV": cell_threshold_v(charge_fc, erased_vt_v, capacitance_ff),
            "erased": charge_fc <= 1e-6, "pulses": pulses,
            "currentDensity": transfer["currentDensity"], "fieldVm": field["fieldVm"]}


def endurance_estimate(pe_cycles, max_cycles=10000):
    cycles, limit = max(0.0, float(pe_cycles)), max(1.0, float(max_cycles))
    fraction = min(1.0, cycles / limit)
    return {"peCycles": cycles, "maxCycles": limit, "wearFraction": fraction,
            "remainingFraction": max(0.0, 1.0 - fraction),
            "thresholdSigmaV": 0.025 + 0.22 * fraction**0.8,
            "thresholdWindowV": 2.0 - 1.4 * fraction,
            "defectDensityM3": 1e16 + 4e17 * fraction**1.35,
            "retentionMultiplier": 1 + 8 * fraction}


def read_slc_block(cells, read_reference_v=1.2, pe_cycles=0, max_cycles=10000, seed=17,
                   erased_vt_v=0.45, capacitance_ff=0.25):
    wear = endurance_estimate(pe_cycles, max_cycles)
    read_cells = []
    for index, cell in enumerate(cells):
        x = ((((int(seed) + index + 1) & 0xffffffff) * 0x45d9f3b) & 0xffffffff) ^ (int(pe_cycles) & 0xffffffff)
        x &= 0xffffffff
        x = (((x ^ (x >> 16)) * 0x45d9f3b) & 0xffffffff)
        x = (x ^ (x >> 16)) & 0xffffffff
        nominal = cell_threshold_v(cell["chargeFc"], erased_vt_v, capacitance_ff)
        programmed = nominal >= float(erased_vt_v) + .4
        wear_shift = (-1 if programmed else 1) * .7 * wear["wearFraction"]
        offset = (x / 0xffffffff * 2 - 1) * wear["thresholdSigmaV"] + wear_shift
        measured = nominal + offset
        bit = 0 if measured >= float(read_reference_v) else 1
        read_cells.append({"index": index, "nominalVtV": nominal, "measuredVtV": measured,
                           "offsetV": offset, "bit": bit,
                           "logicalState": "programmed" if bit == 0 else "erased"})
    bits = "".join(str(cell["bit"]) for cell in read_cells)
    return {"bits": bits, "byte": int(bits, 2) if bits else 0, "cells": read_cells, "wear": wear}


def quantum(gate_v=10.0, oxide_nm=9.0, barrier_ev=3.1, energy_ev=1.0, effective_mass=0.5):
    oxide_nm = float(np.clip(oxide_nm, 5, 15))
    barrier_ev = float(np.clip(barrier_ev, 2, 4))
    energy_ev = float(np.clip(energy_ev, .1, 5))
    oxide_drop = max(0.0, .72 * (float(gate_v) - 1.2))
    field = oxide_drop / oxide_nm * 1e9
    n = 180
    xs = np.linspace(0, oxide_nm, n + 1)
    potential = np.maximum(0.0, barrier_ev - field * xs * 1e-9)
    dx = oxide_nm * 1e-9 / n
    # Both exterior scattering leads use the silicon band edge as V=0.
    right_energy = energy_ev
    matrix = np.zeros((n + 1, n + 1), dtype=np.complex128)
    rhs = np.zeros(n + 1, dtype=np.complex128)
    theta_l = math.acos(float(np.clip(1 - effective_mass * ME * energy_ev * QE * dx**2 / HBAR**2, -1, 1)))
    theta_r = math.acos(float(np.clip(1 - effective_mass * ME * right_energy * QE * dx**2 / HBAR**2, -1, 1)))
    matrix[0, 0] = -np.exp(-1j * theta_l)
    matrix[0, 1] = 1
    rhs[0] = np.exp(1j * theta_l) - np.exp(-1j * theta_l)
    coeff = 2 * effective_mass * ME * dx * dx * QE / HBAR**2
    for i in range(1, n):
        matrix[i, i - 1] = 1
        matrix[i, i] = -2 + coeff * (energy_ev - potential[i])
        matrix[i, i + 1] = 1
    matrix[n, n - 1] = 1
    matrix[n, n] = -np.exp(-1j * theta_r)
    psi = np.linalg.solve(matrix, rhs)
    reflect_amp = psi[0] - 1
    R = abs(reflect_amp)**2
    T = math.sin(theta_r) / math.sin(theta_l) * abs(psi[-1])**2
    flux_residual = abs(R + T - 1)
    forbidden = np.maximum(potential - energy_ev, 0)
    kappa = np.sqrt(2 * effective_mass * ME * forbidden * QE) / HBAR
    exponent = -2 * np.trapezoid(kappa, xs * 1e-9)
    wkb = math.exp(max(-745, min(0, exponent)))
    fn = fn_current_density(field, barrier_ev)
    # Normalize transmitted/reflected flux to the incident flux in this lossless model.
    return {
        "oxideDropV": oxide_drop, "fieldVm": field,
        "transmission": float(T), "reflection": float(R), "fluxResidual": flux_residual, "wkb": wkb,
        "fnCurrent": fn, "solver": "numpy-finite-difference-scattering",
        "points": [{"x": float(x), "v": float(v), "re": float(z.real), "im": float(z.imag), "density": float(abs(z)**2)} for x, v, z in zip(xs, potential, psi)],
    }


def retention(years=1.0, temperature_k=300.0, cycles=0, defects=1e16, q0=.42, field_stress_gvm=0):
    temperature_k = float(np.clip(temperature_k, 250, 450))
    years = max(0.0, float(years))
    wear = endurance_estimate(cycles)
    field_factor = 1 + .5 * max(0.0, float(field_stress_gvm) / 2) ** 2
    gamma = 850 * math.exp(-(.72 * QE) / (KB * temperature_k)) * (1 + max(0, defects) / 8e17) * wear["retentionMultiplier"] * field_factor
    charge = q0 * math.exp(max(-745, -gamma * years * 365.25 * 86400))
    return {"charge": charge, "loss": 1 - charge / q0 if q0 else 0.0, "gamma": gamma, "vtShift": -.35 * charge, "fieldFactor": field_factor}
