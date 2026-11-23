begin;

-- Opção 1: Remove todos os registros de compromissos mantendo a tabela vazia
-- para preservar a compatibilidade das RPCs (normatic_snapshot, normatic_commit, normatic_commit_collection).
delete from public.normatic_compromissos;

commit;
