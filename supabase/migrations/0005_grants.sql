-- ============================================================
-- STASHY — Migration: GRANTs de tabela para authenticated/anon
--
-- Quando uma tabela é criada via SQL direto (em vez da interface
-- visual do Supabase), as roles "authenticated" e "anon" NÃO
-- recebem automaticamente privilégio de acesso à tabela em nível
-- de Postgres. RLS decide QUAIS LINHAS uma role pode ver/alterar,
-- mas antes disso o Postgres decide SE a role pode tocar na
-- tabela — e esse GRANT de base nunca foi dado, causando erro
-- 42501 "permission denied for table X" mesmo com as políticas
-- de RLS corretas.
-- ============================================================

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete
  on all tables in schema public
  to authenticated;

-- anon só precisa de SELECT (conteúdo público, perfil público,
-- coleções públicas) — RLS continua filtrando quais linhas.
grant select
  on all tables in schema public
  to anon;

-- Garante que tabelas futuras (próximas migrations) já nasçam
-- com esses privilégios, sem precisar lembrar de repetir isso.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant select on tables to anon;

-- ============================================================
-- Fim. Depois de rodar isso, o erro "permission denied for
-- table profiles" (e o mesmo problema em qualquer outra tabela)
-- deve desaparecer.
-- ============================================================
