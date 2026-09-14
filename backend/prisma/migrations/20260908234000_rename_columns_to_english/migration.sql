-- Rename physical columns to English (HT-020 follow-up): models and tables are
-- already English; some columns kept Portuguese names via @map. Data preserved.
--
-- The rename is GUARDED: the tables reached this point with mixed column names
-- (only `consents` still carried Portuguese ones), so a plain ALTER ... RENAME
-- aborts the whole migration on a column that is already English. Each rename
-- runs only when the old name is really there, which also makes re-running it
-- on a partially migrated database safe.
DO $$
DECLARE
  renomeacao RECORD;
BEGIN
  FOR renomeacao IN
    SELECT * FROM (VALUES
      ('transactions',      'titular_id',              'holder_id'),
      ('transactions',      'descricao',               'description'),
      ('transactions',      'valor_em_centavos',       'amount_in_cents'),
      ('transactions',      'data_de_competencia',     'due_date'),
      ('transactions',      'identificador_externo',   'external_id'),
      ('external_accounts', 'titular_id',              'holder_id'),
      ('external_accounts', 'identificador_externo',   'external_id'),
      ('external_accounts', 'tipo',                    'type'),
      ('external_accounts', 'saldo_em_centavos',       'balance_in_cents'),
      ('accounts',          'hash_da_senha',           'password_hash'),
      ('accounts',          'criada_em',               'created_at'),
      ('sessions',          'titular_id',              'holder_id'),
      ('sessions',          'hash_do_refresh',         'refresh_token_hash'),
      ('sessions',          'expira_em',               'expires_at'),
      ('sessions',          'revogado_em',             'revoked_at'),
      ('consents',          'titular_id',              'holder_id'),
      ('consents',          'criado_em',               'created_at'),
      ('consents',          'expira_em',               'expires_at'),
      ('consents',          'revogado_em',             'revoked_at'),
      ('consents',          'exclusao_agendada_em',    'deletion_scheduled_at'),
      ('consents',          'ultima_sincronizacao_em', 'last_sync_at')
    ) AS t(tabela, antiga, nova)
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = renomeacao.tabela
        AND column_name = renomeacao.antiga
    ) THEN
      EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO %I',
                     renomeacao.tabela, renomeacao.antiga, renomeacao.nova);
    END IF;
  END LOOP;
END $$;
