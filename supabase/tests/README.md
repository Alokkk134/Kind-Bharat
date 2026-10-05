# Database tests

Run each file in **Supabase → SQL Editor → New query → paste → Run**.
They create throwaway test users/data, check the rules, show PASS/FAIL, then delete the test data.

- `rls_test.sql` — privacy & permissions (who can read/write what). 25 checks.
- `workflow_test.sql` — business rules (verification, budget = goal, proof blocking rule, completion). 10 checks.

Every row should say **PASS**.
