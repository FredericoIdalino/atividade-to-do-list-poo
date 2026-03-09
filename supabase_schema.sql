-- TABLE: usuarios
create table if not exists public.usuarios (
  id uuid primary key,
  nome text,
  email text unique,
  senha text
);

-- TABLE: listas
create table if not exists public.listas (
  id uuid primary key,
  usuario_id uuid not null,
  nome text,
  descricao text,
  constraint listas_usuario_fk
    foreign key (usuario_id)
    references public.usuarios (id)
    on delete cascade
);

-- TABLE: tarefas
create table if not exists public.tarefas (
  id uuid primary key,
  lista_id uuid not null,
  titulo text,
  descricao text,
  data_vencimento date,
  status text,
  constraint tarefas_lista_fk
    foreign key (lista_id)
    references public.listas (id)
    on delete cascade
);

-- Restrição simples para status permitidos
-- (DROP primeiro para poder rodar o script várias vezes sem erro)
alter table public.tarefas drop constraint if exists tarefas_status_check;
alter table public.tarefas
  add constraint tarefas_status_check
  check (status in ('pendente', 'em progresso', 'concluida'));

