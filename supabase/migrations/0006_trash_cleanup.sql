-- ============================================================
-- STASHY — Migration: limpeza automática da Lixeira
-- Sprint 6: Lixeira
--
-- E5/E6: itens com status DELETED há mais de 60 dias são
-- removidos definitivamente todos os dias, via job agendado
-- com pg_cron.
-- ============================================================

-- Habilita a extensão pg_cron, se ainda não estiver habilitada.
-- No Supabase isso normalmente funciona direto pelo SQL Editor;
-- se der erro de permissão, habilite manualmente em
-- Database → Extensions → pg_cron pelo painel.
create extension if not exists pg_cron with schema pg_catalog;

create or replace function public.cleanup_deleted_items()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from items
  where status = 'DELETED'
    and deleted_at <= now() - interval '60 days';
end;
$$;

-- Roda todos os dias às 3h da manhã (horário do servidor do banco).
select cron.schedule(
  'cleanup-deleted-items',
  '0 3 * * *',
  $$ select public.cleanup_deleted_items(); $$
);

-- ============================================================
-- Observação sobre Storage: os itens do MVP atual usam apenas
-- URLs externas de imagem (image_url), não fazem upload para o
-- bucket item-images. Por isso a limpeza acima não precisa (por
-- enquanto) remover arquivos órfãos do Storage. Se no futuro o
-- upload de imagem de item para o Storage for implementado, essa
-- função deve ser revisada para também apagar o arquivo
-- correspondente antes do delete do registro.
-- ============================================================
