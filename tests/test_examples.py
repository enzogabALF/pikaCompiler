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


class TestExamples(unittest.TestCase):
    def test_return_ok(self):
        path = os.path.join(ROOT, 'examples', 'movimiento_return_ok.pika')
        rc, out = run_sem(path)
        self.assertEqual(rc, 0)
        self.assertIn('Semantic analysis OK', out)

    def test_return_type_error(self):
        path = os.path.join(ROOT, 'examples', 'movimiento_return_type_error.pika')
        rc, out = run_sem(path)
        self.assertNotEqual(rc, 0)
        self.assertIn('Return type mismatch', out)

    def test_missing_return_warn(self):
        path = os.path.join(ROOT, 'examples', 'movimiento_missing_return.pika')
        rc, out = run_sem(path)
        self.assertEqual(rc, 0)
        self.assertIn('Warnings:', out)

    def test_return_outside_error(self):
        path = os.path.join(ROOT, 'examples', 'return_outside.pika')
        rc, out = run_sem(path)
        self.assertNotEqual(rc, 0)
        self.assertIn("'RETORNA' used outside of function", out)


if __name__ == '__main__':
    unittest.main()
