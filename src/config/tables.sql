create table "Deduction" (
	id varchar(100) primary key,
	amount int not null,
	description text,
	image text,
	created_on timestamp not null default now(),
	tags varchar (255),
	budgetsID text not null references "Budget"(id)
);