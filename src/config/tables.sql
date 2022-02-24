create table "Deduction" (
	id varchar(100) primary key,
	amount int not null,
	description text,
	image text,
	created_on timestamp not null default now(),
	tags varchar (255),
	budgetsID text not null references "Budget"(id)
);

create table "User" (
	username varchar(100) primary key,
	password varchar(100) not null
)

create table budget (
	id varchar(100) primary key,
	budget int not null,
	user_id varchar(100) not null references "User"("username")
);

create table "BudgetUser" (
	budget_id text references "Budget"(id),
	username text references "User"(username),
	primary key (budget_id, username)
)

insert into "Deduction" (id, amount, budgetsID) values ('763a4430-d8dfgf-4da1-9b5a-ab70e7e1ce84', 200, '763a4430-d88f-4da1-9b5a-ab70e7e1ce84')