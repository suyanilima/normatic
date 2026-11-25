begin;

-- Catálogo compartilhado de Servidores e Membros do TRE-AC (Normativos e Reuniões).
create table if not exists public.normatic_servidores (
  id text primary key check (id ~ '^[A-Za-z0-9][A-Za-z0-9:_ .-]{0,99}$'),
  nome text generated always as (coalesce(payload->>'nome', '')) stored,
  setor text generated always as (coalesce(payload->>'setor', '')) stored,
  cargo text generated always as (coalesce(payload->>'cargo', '')) stored,
  email text generated always as (coalesce(payload->>'email', '')) stored,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  position integer not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.normatic_servidores enable row level security;
revoke all on public.normatic_servidores from anon, authenticated;
grant select on public.normatic_servidores to authenticated;

drop policy if exists normatic_team_read on public.normatic_servidores;
create policy normatic_team_read on public.normatic_servidores for select to authenticated
  using ((select public.normatic_role()) is not null);

do $$
begin
  if to_regprocedure('auth.jwt()') is not null then
    execute 'drop policy if exists normatic_enforce_mfa on public.normatic_servidores';
    execute 'create policy normatic_enforce_mfa on public.normatic_servidores as restrictive for all to authenticated using ((select auth.jwt()->>''aal'') = ''aal2'')';
  end if;
end $$;

create index if not exists normatic_servidores_nome_idx on public.normatic_servidores (lower(nome));
create index if not exists normatic_servidores_setor_idx on public.normatic_servidores (setor);

-- Carga inicial oficial: Resolução 102 CNJ - Anexo V (TRE-AC, Agosto/2026) — exceto Removidos.
insert into public.normatic_servidores (id, payload, position)
values
  ('srv-tre-001', '{"id":"srv-tre-001","nome":"Adenilson Pontes Silva","setor":"AGEL","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 0),
  ('srv-tre-002', '{"id":"srv-tre-002","nome":"Adriana Carvalho de Oliveira","setor":"4ª ZE","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 1),
  ('srv-tre-003', '{"id":"srv-tre-003","nome":"Agatha Pontes Silva Galgani","setor":"SEDES","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 2),
  ('srv-tre-004', '{"id":"srv-tre-004","nome":"Aieza dos Santos Bandeira","setor":"CRIP","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 3),
  ('srv-tre-005', '{"id":"srv-tre-005","nome":"Almir de Araújo Lima","setor":"SEPAG","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 4),
  ('srv-tre-006', '{"id":"srv-tre-006","nome":"Altamiro Lima da Silva","setor":"SGEC","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 5),
  ('srv-tre-007', '{"id":"srv-tre-007","nome":"Ana Cátia Andrade Galdino","setor":"EJE","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 6),
  ('srv-tre-008', '{"id":"srv-tre-008","nome":"Antônia Geanne Araújo de Sousa","setor":"ASPLAN","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 7),
  ('srv-tre-009', '{"id":"srv-tre-009","nome":"Antonio Carlos Ferreira da Silva","setor":"5ª ZE","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 8),
  ('srv-tre-010', '{"id":"srv-tre-010","nome":"Antonio Teixeira Júnior","setor":"SEGLOF","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 9),
  ('srv-tre-011', '{"id":"srv-tre-011","nome":"Auricélio Martins da Silva","setor":"NISIPJ","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 10),
  ('srv-tre-012', '{"id":"srv-tre-012","nome":"Beatriz Pacífico de Assis","setor":"SCLC","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 11),
  ('srv-tre-013', '{"id":"srv-tre-013","nome":"Benjamim Abecassis Júnior","setor":"ASJUIZ","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 12),
  ('srv-tre-014', '{"id":"srv-tre-014","nome":"Benjamim Rodrigues Lima Neto","setor":"3ª ZE","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 13),
  ('srv-tre-015', '{"id":"srv-tre-015","nome":"Bianka da Costa Cardoso","setor":"ASJUIZ","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 14),
  ('srv-tre-016', '{"id":"srv-tre-016","nome":"Breno Bezerra de Souza","setor":"ASJUR","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 15),
  ('srv-tre-017', '{"id":"srv-tre-017","nome":"Bruna Silva Brasil","setor":"ASJUIZ","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 16),
  ('srv-tre-018', '{"id":"srv-tre-018","nome":"Carla Gomes Mendes Diniz","setor":"5ª ZE","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 17),
  ('srv-tre-019', '{"id":"srv-tre-019","nome":"Carlos Alberto Cidral","setor":"SLC","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 18),
  ('srv-tre-020', '{"id":"srv-tre-020","nome":"Carlos Lara Santos","setor":"3ª ZE","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 19),
  ('srv-tre-021', '{"id":"srv-tre-021","nome":"Carlos Venícius Ferreira Ribeiro","setor":"SAOF","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 20),
  ('srv-tre-022', '{"id":"srv-tre-022","nome":"Cleiber Oliveira de Castro","setor":"SSU","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 21),
  ('srv-tre-023', '{"id":"srv-tre-023","nome":"Cleilton de Nazaré Costa","setor":"SCPE","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 22),
  ('srv-tre-024', '{"id":"srv-tre-024","nome":"Clícia Quintela Freitas","setor":"AGEL","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 23),
  ('srv-tre-025', '{"id":"srv-tre-025","nome":"Cristiane Melo de Souza Firmino","setor":"COGEP","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 24),
  ('srv-tre-026', '{"id":"srv-tre-026","nome":"Danilo Monteiro de Barros","setor":"SEDES","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 25),
  ('srv-tre-027', '{"id":"srv-tre-027","nome":"Deborah Karen Cavalcante Costa","setor":"SRJAR","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 26),
  ('srv-tre-028', '{"id":"srv-tre-028","nome":"Dulcileide Rebouças de Mesquita Dalacosta","setor":"SAREMI","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 27),
  ('srv-tre-029', '{"id":"srv-tre-029","nome":"Edcley da Silva Firmino","setor":"STI","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 28),
  ('srv-tre-030', '{"id":"srv-tre-030","nome":"Edilson Duarte Lima Junior","setor":"1ª ZE","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 29),
  ('srv-tre-031', '{"id":"srv-tre-031","nome":"Ellen Cristina Silva de Oliveira","setor":"ASGOVSAOF","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 30),
  ('srv-tre-032', '{"id":"srv-tre-032","nome":"Erismar Oliveira de Almeida","setor":"SECARF","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 31),
  ('srv-tre-033', '{"id":"srv-tre-033","nome":"Eronilson Martins Cordeiro","setor":"SLDAG","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 32),
  ('srv-tre-034', '{"id":"srv-tre-034","nome":"Everton Negreiros Lira","setor":"2ª ZE","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 33),
  ('srv-tre-035', '{"id":"srv-tre-035","nome":"Fabíola Crisóstomo Jucá","setor":"GAJUD","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 34),
  ('srv-tre-036', '{"id":"srv-tre-036","nome":"Fernando Jorge da Silva e Sousa","setor":"SEAD","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 35),
  ('srv-tre-037', '{"id":"srv-tre-037","nome":"Felipe Bezerra Lima","setor":"SDBD","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 36),
  ('srv-tre-038', '{"id":"srv-tre-038","nome":"Fernando José Santos Silva","setor":"SOC","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 37),
  ('srv-tre-039', '{"id":"srv-tre-039","nome":"Francisca Rosicléia Oliveira da Silva","setor":"9ª ZE","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 38),
  ('srv-tre-040', '{"id":"srv-tre-040","nome":"Francisco Cláudio Barbosa Paes","setor":"SLDAG","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 39),
  ('srv-tre-041', '{"id":"srv-tre-041","nome":"Francisco das Chagas Monteiro de Santana","setor":"AGECON","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 40),
  ('srv-tre-042', '{"id":"srv-tre-042","nome":"Francisco Vital de Mascarenhas Filho","setor":"CIE","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 41),
  ('srv-tre-043', '{"id":"srv-tre-043","nome":"Gabriel Lameira de Oliveira","setor":"6ª ZE","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 42),
  ('srv-tre-044', '{"id":"srv-tre-044","nome":"Gustavo Lima Niemeyer","setor":"SECEP","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 43),
  ('srv-tre-045', '{"id":"srv-tre-045","nome":"Helton Santiago Mâcedo","setor":"SECAP","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 44),
  ('srv-tre-046', '{"id":"srv-tre-046","nome":"Igor Chaves de Medeiros","setor":"SECON","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 45),
  ('srv-tre-047', '{"id":"srv-tre-047","nome":"Igor Guerra Gomes Rangel","setor":"9ª ZE","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 46),
  ('srv-tre-048', '{"id":"srv-tre-048","nome":"Ilis Sandro Antonio Areno Ambrozio","setor":"CSCOR","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 47),
  ('srv-tre-049', '{"id":"srv-tre-049","nome":"Japhinis de Paiva Costa Albuquerque","setor":"OUVIDORIA","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 48),
  ('srv-tre-050', '{"id":"srv-tre-050","nome":"Jaqueline Bezerra de Albuquerque Assem","setor":"ASPLAN","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 49),
  ('srv-tre-051', '{"id":"srv-tre-051","nome":"Jean Carlos Freire Lima","setor":"SPEO","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 50),
  ('srv-tre-052', '{"id":"srv-tre-052","nome":"João Antonio Gularte Sena","setor":"8ª ZE","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 51),
  ('srv-tre-053', '{"id":"srv-tre-053","nome":"João Batista Bento da Silva","setor":"COMAP","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 52),
  ('srv-tre-054', '{"id":"srv-tre-054","nome":"João Carlos de Godoy","setor":"COSEG","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 53),
  ('srv-tre-055', '{"id":"srv-tre-055","nome":"Jonathan Messias e Silva","setor":"SEREDE","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 54),
  ('srv-tre-056', '{"id":"srv-tre-056","nome":"Jonathas Santos Almeida de Carvalho","setor":"COCRE","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 55),
  ('srv-tre-057', '{"id":"srv-tre-057","nome":"José Edson Vieira Paiva","setor":"NISIPJ","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 56),
  ('srv-tre-058', '{"id":"srv-tre-058","nome":"José Eduardo dos Santos Bernardino","setor":"COFIN","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 57),
  ('srv-tre-059', '{"id":"srv-tre-059","nome":"Jose Jair Cavalcante de Figueiredo","setor":"ASPLAN","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 58),
  ('srv-tre-060', '{"id":"srv-tre-060","nome":"José Francisco da Silva Galvão","setor":"ASPLAN","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 59),
  ('srv-tre-061', '{"id":"srv-tre-061","nome":"Juliana Balizardo de Oliveira","setor":"SEANT","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 60),
  ('srv-tre-062', '{"id":"srv-tre-062","nome":"Karen Mesquita da Silva Teixeira da Rocha","setor":"GAPRES","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 61),
  ('srv-tre-063', '{"id":"srv-tre-063","nome":"Karina de Freitas Dotto Gondim","setor":"SPEO","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 62),
  ('srv-tre-064', '{"id":"srv-tre-064","nome":"Keith Wilian Bandeira Macedo","setor":"SSEC","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 63),
  ('srv-tre-065', '{"id":"srv-tre-065","nome":"Lais Estela Moreira Figueiredo","setor":"6ª ZE","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 64),
  ('srv-tre-066', '{"id":"srv-tre-066","nome":"Leandro Oliveira de Queiroz","setor":"2ª ZE","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 65),
  ('srv-tre-067', '{"id":"srv-tre-067","nome":"Lidiane Castro Pires","setor":"NULAB","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 66),
  ('srv-tre-068', '{"id":"srv-tre-068","nome":"Luciana de Arruda Macedo Santos","setor":"ASPRES","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 67),
  ('srv-tre-069', '{"id":"srv-tre-069","nome":"Luciane Socorro Ferreira Medeiros","setor":"GASAOF","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 68),
  ('srv-tre-070', '{"id":"srv-tre-070","nome":"Lucir Rocio Vaz","setor":"SDBD","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 69),
  ('srv-tre-071', '{"id":"srv-tre-071","nome":"Luiz Antonio Barroso Valli","setor":"1ª ZE","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 70),
  ('srv-tre-072', '{"id":"srv-tre-072","nome":"Manoel Raimundo de Souza","setor":"SGEC","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 71),
  ('srv-tre-073', '{"id":"srv-tre-073","nome":"Marcus José Lima de Barros","setor":"SEGLOF","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 72),
  ('srv-tre-074', '{"id":"srv-tre-074","nome":"Maria Clara Carlos Luna Silvério","setor":"ASCRE","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 73),
  ('srv-tre-075', '{"id":"srv-tre-075","nome":"Maria de Fátima do Nascimento","setor":"SLDAG","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 74),
  ('srv-tre-076', '{"id":"srv-tre-076","nome":"Maria Goretti Hadad Farias","setor":"SRJAR","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 75),
  ('srv-tre-077', '{"id":"srv-tre-077","nome":"Maria Lúcia Gabriel Fontes da Silva","setor":"ASJUIZ","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 76),
  ('srv-tre-078', '{"id":"srv-tre-078","nome":"Maria Verônica da Costa","setor":"DG","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 77),
  ('srv-tre-079', '{"id":"srv-tre-079","nome":"Marijone Pinheiro de Araújo","setor":"COSES","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 78),
  ('srv-tre-080', '{"id":"srv-tre-080","nome":"Messias Braga de Carvalho","setor":"8ª ZE","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 79),
  ('srv-tre-081', '{"id":"srv-tre-081","nome":"Michela Albuquerque Paes","setor":"SEUE","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 80),
  ('srv-tre-082', '{"id":"srv-tre-082","nome":"Nathalia Andrade Silva Lima","setor":"SECON","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 81),
  ('srv-tre-083', '{"id":"srv-tre-083","nome":"Orfeu Bento Assem","setor":"SETRAN","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 82),
  ('srv-tre-084', '{"id":"srv-tre-084","nome":"Pablo de Freitas Alves","setor":"9ª ZE","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 83),
  ('srv-tre-085', '{"id":"srv-tre-085","nome":"Patrícia Tieme Imada","setor":"COAUDI","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 84),
  ('srv-tre-086', '{"id":"srv-tre-086","nome":"Paulo Roberto Pereira de Souza","setor":"SEPAG","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 85),
  ('srv-tre-087', '{"id":"srv-tre-087","nome":"Raimundo Denis dos Anjos","setor":"SPEF","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 86),
  ('srv-tre-088', '{"id":"srv-tre-088","nome":"Raimundo Francisco de Souza Junior","setor":"SEPAG","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 87),
  ('srv-tre-089', '{"id":"srv-tre-089","nome":"Raimundo Ferreira Vital","setor":"SETRAN","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 88),
  ('srv-tre-090', '{"id":"srv-tre-090","nome":"Reinaldo Colares Franco","setor":"ASJUIZ","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 89),
  ('srv-tre-091', '{"id":"srv-tre-091","nome":"Renata dos Santos Maia","setor":"SECAP","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 90),
  ('srv-tre-092', '{"id":"srv-tre-092","nome":"Renata Nogueira Colaça Pires","setor":"ASPLAN","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 91),
  ('srv-tre-093', '{"id":"srv-tre-093","nome":"Reniele Gomes Moreira","setor":"SEAPTIC","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 92),
  ('srv-tre-094', '{"id":"srv-tre-094","nome":"Rinauro Souza Santos Júnior","setor":"SASBEN","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 93),
  ('srv-tre-095', '{"id":"srv-tre-095","nome":"Roberval Santos Cavalcante Neto","setor":"7ª ZE","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 94),
  ('srv-tre-096', '{"id":"srv-tre-096","nome":"Rogério Ferreira de Sousa","setor":"SRDP","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 95),
  ('srv-tre-097', '{"id":"srv-tre-097","nome":"Ronaldo Braga de Paula","setor":"SEAD","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 96),
  ('srv-tre-098', '{"id":"srv-tre-098","nome":"Rosangela Rodrigues Cordeiro","setor":"7ª ZE","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 97),
  ('srv-tre-099', '{"id":"srv-tre-099","nome":"Rosimar Rodrigues Lima","setor":"SEREDE","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 98),
  ('srv-tre-100', '{"id":"srv-tre-100","nome":"Sander Samuel Nascimento Araripe","setor":"SECEP","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 99),
  ('srv-tre-101', '{"id":"srv-tre-101","nome":"Sandro Roberto de Oliveira Bezerra","setor":"SEJUD","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 100),
  ('srv-tre-102', '{"id":"srv-tre-102","nome":"Sérgio Luíz Mariano de Almeida","setor":"SEAPTIC","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 101),
  ('srv-tre-103', '{"id":"srv-tre-103","nome":"Sharlene Lira Sandra de Vasconcelos","setor":"SEDES","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 102),
  ('srv-tre-104', '{"id":"srv-tre-104","nome":"Sidney Brandão Mendes","setor":"SCPE","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 103),
  ('srv-tre-105', '{"id":"srv-tre-105","nome":"Silvio Forastiero Frazão","setor":"SCSEG","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 104),
  ('srv-tre-106', '{"id":"srv-tre-106","nome":"Soliana Vieira e Silva","setor":"1ª ZE","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 105),
  ('srv-tre-107', '{"id":"srv-tre-107","nome":"Suellen da Costa Vieira Soler","setor":"ASGIM","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 106),
  ('srv-tre-108', '{"id":"srv-tre-108","nome":"Thallys Bandeira Roque Maia Pinto","setor":"SDBD","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 107),
  ('srv-tre-109', '{"id":"srv-tre-109","nome":"Valéria Assis Lima","setor":"AGEL","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 108),
  ('srv-tre-110', '{"id":"srv-tre-110","nome":"Vinicius Coelho Araujo","setor":"2ª ZE","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 109),
  ('srv-tre-111', '{"id":"srv-tre-111","nome":"Viviani Czarnecki Mayorquim","setor":"SEGLOF","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 110),
  ('srv-tre-112', '{"id":"srv-tre-112","nome":"Washington dos Reis Leite","setor":"SASBEN","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 111),
  ('srv-tre-113', '{"id":"srv-tre-113","nome":"Yasmim de Jesus Gaertner","setor":"SLDAG","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 112),
  ('srv-tre-114', '{"id":"srv-tre-114","nome":"Zanúbia Rodrigues Pereira","setor":"SEANT","cargo":"Analista Judiciário","email":"","whatsapp":""}'::jsonb, 113),
  ('srv-tre-115', '{"id":"srv-tre-115","nome":"Roselha Gondim dos Santos Pardo","setor":"TRF1","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 114),
  ('srv-tre-116', '{"id":"srv-tre-116","nome":"Daniele Carlos de Oliveira Nunes","setor":"ASCOM","cargo":"Assessor II","email":"","whatsapp":""}'::jsonb, 115),
  ('srv-tre-117', '{"id":"srv-tre-117","nome":"Glayson Jean Moreno Dantas","setor":"NISIPJ","cargo":"Assessor I","email":"","whatsapp":""}'::jsonb, 116),
  ('srv-tre-118', '{"id":"srv-tre-118","nome":"Raphael Batista da Silva","setor":"ASPRES","cargo":"Assessor I","email":"","whatsapp":""}'::jsonb, 117),
  ('srv-tre-119', '{"id":"srv-tre-119","nome":"Valma Veloso","setor":"GACRE","cargo":"Chefe de Gabinete","email":"","whatsapp":""}'::jsonb, 118),
  ('srv-tre-120', '{"id":"srv-tre-120","nome":"Antonia Pereira da Costa","setor":"5ª ZE","cargo":"Recepcionista","email":"","whatsapp":""}'::jsonb, 119),
  ('srv-tre-121', '{"id":"srv-tre-121","nome":"Aureni Pereira Feitosa","setor":"GSTI","cargo":"Agente Administrativo","email":"","whatsapp":""}'::jsonb, 120),
  ('srv-tre-122', '{"id":"srv-tre-122","nome":"Diego Cesar Ribeiro de Matos","setor":"SEMAP","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 121),
  ('srv-tre-123', '{"id":"srv-tre-123","nome":"Ellen Cristina Enes Valentim da Silva","setor":"GAPRES","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 122),
  ('srv-tre-124', '{"id":"srv-tre-124","nome":"Gleyson Menezes Moreira","setor":"SEMAP","cargo":"Técnico Administrativo Educacional","email":"","whatsapp":""}'::jsonb, 123),
  ('srv-tre-125', '{"id":"srv-tre-125","nome":"Irisnaila Lima Belém","setor":"SASBEN","cargo":"Gestora de Políticas Públicas","email":"","whatsapp":""}'::jsonb, 124),
  ('srv-tre-126', '{"id":"srv-tre-126","nome":"Janice Ribeiro Lima","setor":"DG","cargo":"Técnico em Gestão Pública","email":"","whatsapp":""}'::jsonb, 125),
  ('srv-tre-127', '{"id":"srv-tre-127","nome":"Laila Oliveira Barros","setor":"SPEF","cargo":"Gestora de Políticas Públicas","email":"","whatsapp":""}'::jsonb, 126),
  ('srv-tre-128', '{"id":"srv-tre-128","nome":"Marcio Venicius Santos de Oliveira","setor":"ASGIM","cargo":"Engenheiro Civil","email":"","whatsapp":""}'::jsonb, 127),
  ('srv-tre-129', '{"id":"srv-tre-129","nome":"Marco Aurélio Bortoli","setor":"SDBD","cargo":"Analista de Sistemas Pleno","email":"","whatsapp":""}'::jsonb, 128),
  ('srv-tre-130', '{"id":"srv-tre-130","nome":"Maria Francisca da Conceição Ferreira","setor":"SECEP","cargo":"Agente Administrativo","email":"","whatsapp":""}'::jsonb, 129),
  ('srv-tre-131', '{"id":"srv-tre-131","nome":"Maria Alessandra Pinto Dantas","setor":"SCLC","cargo":"Técnico em Gestão Pública","email":"","whatsapp":""}'::jsonb, 130),
  ('srv-tre-132', '{"id":"srv-tre-132","nome":"Maria Lucinda Aguiar Passos","setor":"7ª ZE","cargo":"Agente Administrativo","email":"","whatsapp":""}'::jsonb, 131),
  ('srv-tre-133', '{"id":"srv-tre-133","nome":"Marivan Lima Nobre","setor":"SPEO","cargo":"Gestor de Políticas Públicas","email":"","whatsapp":""}'::jsonb, 132),
  ('srv-tre-134', '{"id":"srv-tre-134","nome":"Mayra Danieli Almeida de Oliveira","setor":"4ª ZE","cargo":"Contador","email":"","whatsapp":""}'::jsonb, 133),
  ('srv-tre-135', '{"id":"srv-tre-135","nome":"Myria Greyce Mendes de Souza Castro","setor":"ASJUR","cargo":"Técnico Judiciário","email":"","whatsapp":""}'::jsonb, 134),
  ('srv-tre-136', '{"id":"srv-tre-136","nome":"Rodolfo Quiroga Elias","setor":"ASGIM","cargo":"Arquiteto","email":"","whatsapp":""}'::jsonb, 135),
  ('srv-tre-137', '{"id":"srv-tre-137","nome":"Rose Jocely Lopes dos Santos Moreira","setor":"GSTI","cargo":"Agente Administrativo","email":"","whatsapp":""}'::jsonb, 136),
  ('srv-tre-138', '{"id":"srv-tre-138","nome":"Sheila Maria dos Santos Carvalho","setor":"SDP","cargo":"Escriturária","email":"","whatsapp":""}'::jsonb, 137),
  ('srv-tre-139', '{"id":"srv-tre-139","nome":"Suzy Imaculada de Oliveira Lira Leal","setor":"SECARF","cargo":"Especialista Executivo","email":"","whatsapp":""}'::jsonb, 138),
  ('srv-tre-140', '{"id":"srv-tre-140","nome":"Wanderley Vasconcelos da Silva","setor":"SEUE","cargo":"Auxiliar de Proc. de Dados","email":"","whatsapp":""}'::jsonb, 139),
  ('srv-tre-141', '{"id":"srv-tre-141","nome":"Waldirene Oliveira da Cruz-Lima Cordeiro","setor":"CORTE","cargo":"Desembargadora","email":"","whatsapp":""}'::jsonb, 140),
  ('srv-tre-142', '{"id":"srv-tre-142","nome":"Lois Carlos Arruda","setor":"CORTE","cargo":"Desembargador","email":"","whatsapp":""}'::jsonb, 141),
  ('srv-tre-143', '{"id":"srv-tre-143","nome":"Denise Castelo Bonfim","setor":"CORTE","cargo":"Desembargadora Substituta","email":"","whatsapp":""}'::jsonb, 142),
  ('srv-tre-144', '{"id":"srv-tre-144","nome":"Roberto Barros dos Santos","setor":"CORTE","cargo":"Desembargador Substituto","email":"","whatsapp":""}'::jsonb, 143),
  ('srv-tre-145', '{"id":"srv-tre-145","nome":"Rogéria José Epaminondas Mesquita","setor":"CORTE","cargo":"Juíza de Direito","email":"","whatsapp":""}'::jsonb, 144),
  ('srv-tre-146', '{"id":"srv-tre-146","nome":"Lilian Deise Braga Paiva","setor":"CORTE","cargo":"Juíza de Direito","email":"","whatsapp":""}'::jsonb, 145),
  ('srv-tre-147', '{"id":"srv-tre-147","nome":"Luana Cláudia de Albuquerque Campos","setor":"CORTE","cargo":"Juíza de Direito Substituta","email":"","whatsapp":""}'::jsonb, 146),
  ('srv-tre-148', '{"id":"srv-tre-148","nome":"Leandro Leri Gross","setor":"CORTE","cargo":"Juiz de Direito Substituto","email":"","whatsapp":""}'::jsonb, 147),
  ('srv-tre-149', '{"id":"srv-tre-149","nome":"Jair Araújo Facundes","setor":"CORTE","cargo":"Juiz Federal","email":"","whatsapp":""}'::jsonb, 148),
  ('srv-tre-150', '{"id":"srv-tre-150","nome":"Luzia Farias da Silva Mendonça","setor":"CORTE","cargo":"Juíza Federal Substituta","email":"","whatsapp":""}'::jsonb, 149),
  ('srv-tre-151', '{"id":"srv-tre-151","nome":"Thalles Vinicius de Souza Sales","setor":"CORTE","cargo":"Jurista","email":"","whatsapp":""}'::jsonb, 150),
  ('srv-tre-152', '{"id":"srv-tre-152","nome":"Luciano Oliveira de Melo","setor":"CORTE","cargo":"Jurista Substituto","email":"","whatsapp":""}'::jsonb, 151),
  ('srv-tre-153', '{"id":"srv-tre-153","nome":"Emerson Silva Costa","setor":"CORTE","cargo":"Jurista Substituto","email":"","whatsapp":""}'::jsonb, 152),
  ('srv-tre-154', '{"id":"srv-tre-154","nome":"Vitor Hugo Caldeira Teodoro","setor":"MPE","cargo":"Procurador Regional Eleitoral","email":"","whatsapp":""}'::jsonb, 153),
  ('srv-tre-155', '{"id":"srv-tre-155","nome":"Fernando José Piazenski","setor":"MPE","cargo":"Procurador Regional Eleitoral Substituto","email":"","whatsapp":""}'::jsonb, 154),
  ('srv-tre-156', '{"id":"srv-tre-156","nome":"Isabelle Sacramento Torturela","setor":"GAPRES","cargo":"Juíza Auxiliar da GAPRES","email":"","whatsapp":""}'::jsonb, 155),
  ('srv-tre-157', '{"id":"srv-tre-157","nome":"Fábio Alexandre Costa de Farias","setor":"GACRE","cargo":"Juiz Auxiliar da Corregedoria","email":"","whatsapp":""}'::jsonb, 156),
  ('srv-tre-158', '{"id":"srv-tre-158","nome":"Luís Gustavo Alcalde Pinto","setor":"2ª ZE","cargo":"Juiz Eleitoral","email":"","whatsapp":""}'::jsonb, 157),
  ('srv-tre-159', '{"id":"srv-tre-159","nome":"Caique Cirano Di Paula","setor":"3ª ZE","cargo":"Juiz Eleitoral","email":"","whatsapp":""}'::jsonb, 158),
  ('srv-tre-160', '{"id":"srv-tre-160","nome":"Rosilene de Santana Souza","setor":"4ª ZE","cargo":"Juíza Eleitoral","email":"","whatsapp":""}'::jsonb, 159),
  ('srv-tre-161', '{"id":"srv-tre-161","nome":"Stéphanie Winck Ribeiro de Moura","setor":"5ª ZE","cargo":"Juíza Eleitoral","email":"","whatsapp":""}'::jsonb, 160),
  ('srv-tre-162', '{"id":"srv-tre-162","nome":"José Leite de Paula Neto","setor":"6ª ZE","cargo":"Juiz Eleitoral","email":"","whatsapp":""}'::jsonb, 161),
  ('srv-tre-163', '{"id":"srv-tre-163","nome":"Gabriela Rodrigues Elleres","setor":"7ª ZE","cargo":"Juíza Eleitoral","email":"","whatsapp":""}'::jsonb, 162),
  ('srv-tre-164', '{"id":"srv-tre-164","nome":"Romário Divino Farias","setor":"8ª ZE","cargo":"Juiz Eleitoral","email":"","whatsapp":""}'::jsonb, 163),
  ('srv-tre-165', '{"id":"srv-tre-165","nome":"Gustavo Sirena","setor":"9ª ZE","cargo":"Juiz Eleitoral","email":"","whatsapp":""}'::jsonb, 164),
  ('srv-tre-166', '{"id":"srv-tre-166","nome":"Dayan Moreira Albuquerque","setor":"1ª ZE","cargo":"Promotor Eleitoral","email":"","whatsapp":""}'::jsonb, 165),
  ('srv-tre-167', '{"id":"srv-tre-167","nome":"Glaucio Ney Shiroma Oshiro","setor":"1ª ZE","cargo":"Promotor Eleitoral Substituto","email":"","whatsapp":""}'::jsonb, 166),
  ('srv-tre-168', '{"id":"srv-tre-168","nome":"Renan Augusto Conçalves Batista","setor":"2ª ZE","cargo":"Promotor Eleitoral","email":"","whatsapp":""}'::jsonb, 167),
  ('srv-tre-169', '{"id":"srv-tre-169","nome":"Wendelson Mendonça da Cunha","setor":"2ª ZE","cargo":"Promotor Eleitoral Substituto","email":"","whatsapp":""}'::jsonb, 168),
  ('srv-tre-170', '{"id":"srv-tre-170","nome":"Júlia Fernandes de Brito","setor":"3ª ZE","cargo":"Promotora Eleitoral","email":"","whatsapp":""}'::jsonb, 169),
  ('srv-tre-171', '{"id":"srv-tre-171","nome":"Rejane Mara dos Santos","setor":"3ª ZE","cargo":"Promotor Eleitoral Substituto","email":"","whatsapp":""}'::jsonb, 170),
  ('srv-tre-172', '{"id":"srv-tre-172","nome":"Thiago Marques Salomão","setor":"4ª ZE","cargo":"Promotor Eleitoral","email":"","whatsapp":""}'::jsonb, 171),
  ('srv-tre-173', '{"id":"srv-tre-173","nome":"Manuela Canuto de Santana Farhat","setor":"4ª ZE","cargo":"Promotor Eleitoral Substituto","email":"","whatsapp":""}'::jsonb, 172),
  ('srv-tre-174', '{"id":"srv-tre-174","nome":"Lucas Ferreira Buno Iwakami de Mattos","setor":"5ª ZE","cargo":"Promotor Eleitoral","email":"","whatsapp":""}'::jsonb, 173),
  ('srv-tre-175', '{"id":"srv-tre-175","nome":"Caroline Caldas Correia","setor":"5ª ZE","cargo":"Promotora Eleitoral Substituta","email":"","whatsapp":""}'::jsonb, 174),
  ('srv-tre-176', '{"id":"srv-tre-176","nome":"Luã Brito Barbosa","setor":"6ª ZE","cargo":"Promotora Eleitoral","email":"","whatsapp":""}'::jsonb, 175),
  ('srv-tre-177', '{"id":"srv-tre-177","nome":"Giovana Kahata de Toledo Postali Stachetti","setor":"7ª ZE","cargo":"Promotora Eleitoral","email":"","whatsapp":""}'::jsonb, 176),
  ('srv-tre-178', '{"id":"srv-tre-178","nome":"Giselle Luiza Silva","setor":"7ª ZE","cargo":"Promotor Eleitoral Substituto","email":"","whatsapp":""}'::jsonb, 177),
  ('srv-tre-179', '{"id":"srv-tre-179","nome":"Fernando Henrique Santos Terra","setor":"8ª ZE","cargo":"Promotora Eleitoral","email":"","whatsapp":""}'::jsonb, 178),
  ('srv-tre-180', '{"id":"srv-tre-180","nome":"Vanderlei Batista Cerqueira","setor":"8ª ZE","cargo":"Promotor Eleitoral Substituto","email":"","whatsapp":""}'::jsonb, 179),
  ('srv-tre-181', '{"id":"srv-tre-181","nome":"Nelma Araújo Melo de Siqueira","setor":"9ª ZE","cargo":"Promotor Eleitoral","email":"","whatsapp":""}'::jsonb, 180),
  ('srv-tre-182', '{"id":"srv-tre-182","nome":"Marcela Cristina Ozório","setor":"9ª ZE","cargo":"Promotora Eleitoral Substituta","email":"","whatsapp":""}'::jsonb, 181)
on conflict (id) do nothing;

-- Registra criações, edições e exclusões futuras no Histórico de atividades.
do $$
begin
  if to_regprocedure('public.normatic_audit_change()') is not null then
    execute 'drop trigger if exists normatic_audit_change on public.normatic_servidores';
    execute 'create trigger normatic_audit_change after insert or update or delete on public.normatic_servidores for each row execute function public.normatic_audit_change()';
  end if;
end $$;

create or replace function public.normatic_servidores_list() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare rows jsonb;
begin
  if public.normatic_role() is null then
    raise exception 'Acesso restrito aos membros autorizados da equipe.' using errcode = '42501';
  end if;
  select coalesce(jsonb_agg(payload order by lower(coalesce(payload->>'nome', '')), id), '[]'::jsonb)
    into rows
    from public.normatic_servidores;
  return rows;
end $$;

create or replace function public.normatic_servidores_upsert(item jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(public.normatic_role(), '') not in ('admin', 'editor') then
    raise exception 'Você não possui permissão para alterar os dados da equipe.' using errcode = '42501';
  end if;
  if item is null or jsonb_typeof(item) <> 'object' then
    raise exception 'Registro de servidor inválido.';
  end if;
  if jsonb_typeof(item->'id') is distinct from 'string' or coalesce(item->>'id', '') = '' or length(item->>'id') > 100 then
    raise exception 'Identificação inválida para servidor.';
  end if;
  if coalesce(btrim(item->>'nome'), '') = '' then
    raise exception 'Informe o nome do servidor ou membro.';
  end if;

  insert into public.normatic_servidores as stored (id, payload, position, updated_by)
  values (item->>'id', item, 0, auth.uid())
  on conflict (id) do update
    set payload = excluded.payload,
        updated_by = excluded.updated_by,
        updated_at = now()
    where stored.payload is distinct from excluded.payload;

  return item;
end $$;

create or replace function public.normatic_servidores_delete(target_id text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare removed integer;
begin
  if coalesce(public.normatic_role(), '') not in ('admin', 'editor') then
    raise exception 'Você não possui permissão para alterar os dados da equipe.' using errcode = '42501';
  end if;
  if coalesce(btrim(target_id), '') = '' then
    raise exception 'Identificação inválida para exclusão.';
  end if;
  delete from public.normatic_servidores where id = target_id;
  get diagnostics removed = row_count;
  return removed > 0;
end $$;

revoke all on function public.normatic_servidores_list() from public, anon;
revoke all on function public.normatic_servidores_upsert(jsonb) from public, anon;
revoke all on function public.normatic_servidores_delete(text) from public, anon;
grant execute on function public.normatic_servidores_list() to authenticated;
grant execute on function public.normatic_servidores_upsert(jsonb) to authenticated;
grant execute on function public.normatic_servidores_delete(text) to authenticated;

commit;
