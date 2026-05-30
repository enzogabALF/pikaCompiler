import subprocess
import sys
import os
import unittest


ROOT = os.path.dirname(os.path.dirname(__file__))
SEM_RUNNER = os.path.join(ROOT, 'src', 'semantics_runner.py')


def run_sem(file_path):
    cmd = [sys.executable, SEM_RUNNER, file_path]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    return proc.returncode, proc.stdout


class TestEdgeCases(unittest.TestCase):
    def test_index_nonliteral_ok(self):
        path = os.path.join(ROOT, 'examples', 'index_out_of_bounds_nonliteral.pika')
        rc, out = run_sem(path)
        self.assertEqual(rc, 0)
        self.assertIn('Semantic analysis OK', out)

    def test_unknown_identifier_error(self):
        path = os.path.join(ROOT, 'examples', 'unknown_identifier.pika')
        rc, out = run_sem(path)
        self.assertNotEqual(rc, 0)
        self.assertIn("Undeclared identifier 'x'", out)

    def test_assign_type_mismatch(self):
        path = os.path.join(ROOT, 'examples', 'assign_type_mismatch.pika')
        rc, out = run_sem(path)
        self.assertNotEqual(rc, 0)
        self.assertIn('Type error: cannot assign', out)

    def test_call_arg_mismatch(self):
        path = os.path.join(ROOT, 'examples', 'call_arg_mismatch.pika')
        rc, out = run_sem(path)
        self.assertNotEqual(rc, 0)
        self.assertIn("expects 1 args, got 2", out)


if __name__ == '__main__':
    unittest.main()
