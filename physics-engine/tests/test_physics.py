import unittest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.physics import (quantum, retention, oxide_field, fn_current_density,
                         fn_charge_increment_fc, ispp_program, fn_erase,
                         read_slc_block, endurance_estimate)


class QuantumModelTests(unittest.TestCase):
    def test_scattering_flux_and_probability_density(self):
        result = quantum()
        self.assertGreaterEqual(result["transmission"], 0)
        self.assertLessEqual(result["transmission"], 1)
        self.assertAlmostEqual(result["transmission"] + result["reflection"], 1.0, places=12)
        self.assertTrue(all(p["density"] >= 0 for p in result["points"]))
        for gate in (0, 5, 10, 20):
            for thickness in (5, 9, 15):
                for energy in (.1, 1, 3, 5):
                    sample = quantum(gate_v=gate, oxide_nm=thickness, energy_ev=energy)
                    self.assertLess(sample["fluxResidual"], 1e-8)

    def test_thicker_barrier_lowers_wkb(self):
        thin = quantum(gate_v=5, oxide_nm=5, barrier_ev=3, energy_ev=.5)
        thick = quantum(gate_v=5, oxide_nm=15, barrier_ev=3, energy_ev=.5)
        self.assertLess(thick["wkb"], thin["wkb"])

    def test_field_emission_responds_to_oxide_voltage(self):
        low = quantum(gate_v=8)
        high = quantum(gate_v=16)
        self.assertGreater(high["fieldVm"], low["fieldVm"])
        self.assertGreater(high["fnCurrent"], low["fnCurrent"])

    def test_retention_declines_with_time_and_temperature(self):
        short = retention(years=.2, temperature_k=300)
        long = retention(years=10, temperature_k=300)
        hot = retention(years=1, temperature_k=420)
        self.assertGreater(short["charge"], long["charge"])
        self.assertGreater(retention(years=1, temperature_k=300)["charge"], hot["charge"])

    def test_fowler_nordheim_reference_value_and_units(self):
        field = oxide_field(10, 9)
        self.assertAlmostEqual(field["oxideDropV"], 6.336, places=12)
        self.assertAlmostEqual(field["fieldVm"], 7.04e8, delta=1e-4)
        self.assertAlmostEqual(fn_current_density(2e9, 3.1), 15942.4554946, delta=1e-4)
        transfer = fn_charge_increment_fc(2e9, 3.1, pulse_width_us=5, area_um2=.02)
        self.assertAlmostEqual(transfer["chargeFc"], transfer["chargeC"] * 1e15, places=12)

    def test_ispp_program_verify_and_reverse_field_erase(self):
        program = ispp_program(oxide_nm=9, pulse_width_us=5, area_um2=.02)
        self.assertTrue(program["verified"])
        self.assertGreater(len(program["pulses"]), 1)
        self.assertTrue(all(program["pulses"][i]["voltageV"] < program["pulses"][i+1]["voltageV"] for i in range(len(program["pulses"])-1)))
        self.assertTrue(all(not pulse["verified"] for pulse in program["pulses"][:-1]))
        erased = fn_erase(initial_charge_fc=program["chargeFc"], oxide_nm=9, pulse_width_us=5, area_um2=.02)
        self.assertTrue(erased["erased"])
        self.assertLess(erased["chargeFc"], program["chargeFc"])

    def test_slc_read_endurance_spread_and_retention_wear(self):
        program = ispp_program(oxide_nm=9)
        cells = [{"chargeFc": program["chargeFc"]}] + [{"chargeFc": 0.0} for _ in range(7)]
        read = read_slc_block(cells, read_reference_v=1.2, pe_cycles=0)
        self.assertEqual(read["bits"], "01111111")
        worn_read = read_slc_block([{"chargeFc": 0.0} for _ in range(8)], read_reference_v=1.2, pe_cycles=10000)
        self.assertNotEqual(worn_read["bits"], "11111111")
        self.assertEqual(worn_read["bits"], read_slc_block([{"chargeFc": 0.0} for _ in range(8)], read_reference_v=1.2, pe_cycles=10000)["bits"])
        fresh, worn = endurance_estimate(0), endurance_estimate(5000)
        self.assertGreater(worn["thresholdSigmaV"], fresh["thresholdSigmaV"])
        self.assertGreater(worn["retentionMultiplier"], fresh["retentionMultiplier"])
        fresh_q = retention(years=5, temperature_k=373, cycles=0)["charge"]
        worn_q = retention(years=5, temperature_k=373, cycles=5000)["charge"]
        self.assertLess(worn_q, fresh_q)


if __name__ == "__main__":
    unittest.main()
