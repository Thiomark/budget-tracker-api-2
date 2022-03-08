

CREATE TABLE "User"
(
    username varchar(100) NOT NULL PRIMARY KEY,
    password varchar(100) NOT NULL,
    created_on timestamp without time zone NOT NULL DEFAULT now(),
    name varchar(255) NOT NULL
)

CREATE TABLE "Budget"
(
    id varchar(100) NOT NULL PRIMARY KEY,
    budget int NOT NULL,
    user_id varchar(100) NOT NULL REFERENCES "User" (username),
    created_on timestamp without time zone NOT NULL DEFAULT now()
)

CREATE TABLE "Deduction"
(
    id varchar(100) NOT NULL PRIMARY KEY,
    amount int NOT NULL,
    description text,
    image text,
    created_on timestamp without time zone NOT NULL DEFAULT now(),
    tags varchar(255),
    budgets_id text NOT NULL REFERENCES "Budget" (id)
)

CREATE TABLE "BudgetUser"
(
    budget_id text NOT NULL REFERENCES "Budget" (id),
    username text NOT NULL REFERENCES "User" (username),
    created_on timestamp without time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (budget_id, username)
)