-- ============================================================
-- STASHY — Migration: criação automática de profile no cadastro
-- Sprint 1: Auth
--
-- Ao inserir um novo usuário em auth.users (via signUp), este
-- trigger cria a linha correspondente em public.profiles usando
-- os metadados enviados no cadastro (username, display_name).
-- Isso garante atomicidade: nunca existe um auth.users sem o
-- profile correspondente.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'username')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================
-- Importante: o frontend precisa enviar username e display_name
-- como metadata no momento do signUp, por exemplo:
--
-- supabase.auth.signUp({
--   email,
--   password,
--   options: {
--     data: { username, display_name: displayName }
--   }
-- })
--
-- Se o username já existir, o insert em profiles falha (unique
-- constraint) e a criação do usuário no auth.users é revertida
-- junto (mesma transação do trigger) — por isso é essencial
-- validar a disponibilidade do username no frontend ANTES de
-- chamar signUp, para não gerar erros confusos no cadastro.
-- ============================================================
