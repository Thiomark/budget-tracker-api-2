delete from 'BudgetUser'
delete from 'Deduction'
delete from 'Budget'

insert into "Budget" (budget, user_id, id, created_on) values 
    (10000, 'thiomark', '56cdff75-a683-44bc-9272-2c4b793e5045', '2021-12-14T09:03:13.325Z'),
    (3500, 'thiomark', '5cbbf39f-c0b4-4034-9745-d1530e87e2fd', '2022-01-10T09:03:13.325Z')
    
insert into "BudgetUser" (username, budget_id) values 
    ('thiomark', '56cdff75-a683-44bc-9272-2c4b793e5045'),
    ('thiomark', '5cbbf39f-c0b4-4034-9745-d1530e87e2fd')



insert into "Deduction" (id, amount, description, image, tags, budgets_id) values
    ('c3f5236a-c2aa-4722-a0e1-b99ef59d659d', -1080, 'Paying Mr Sabata for fixing the geyser', 'null', 'Geyser', '56cdff75-a683-44bc-9272-2c4b793e5045'),
    ('d942ae4d-3fda-4eaa-a090-ab7e05673f5f', -1600, 'Rosebank college deposit fee', 'null', 'Collage', '56cdff75-a683-44bc-9272-2c4b793e5045'),
    ('8991265d-75f5-4558-8d2a-97d71ec2569a', -300, 'Rosebank college registration fee', 'null', 'Collage', '56cdff75-a683-44bc-9272-2c4b793e5045'),
    ('9d2d99a8-09c0-46c5-a2fe-6407e7d69000', -599, 'Buying the router at pep store, i can''t find the receipt', 'null', 'Router ', '5cbbf39f-c0b4-4034-9745-d1530e87e2fd'),
    ('73dcffbd-e8ab-46f2-a8c0-d1b730e94525', -50, 'Ovk', '1644763909636-proof.jpg', 'Town house repairments', '5cbbf39f-c0b4-4034-9745-d1530e87e2fd'),
    ('c5c3431c-b207-4d68-9a35-b7c928cb641b', -98.4, 'Petrol for cutting the grass', '1644763745503-proof.jpg', 'Town house repairments', '5cbbf39f-c0b4-4034-9745-d1530e87e2fd'),
    ('a6f59efe-bfb4-4d60-9d7a-5549d2361930', -82.7, 'Petrol for cutting the grass ', '1644764310042-proof.jpg', 'Town house repairments', '5cbbf39f-c0b4-4034-9745-d1530e87e2fd'),
    ('2914a95f-c805-4ac3-9bfa-5f10285f5297', -119, 'Petrol for cutting the grass ', '1644762860909-proof.jpg', 'Town house repairments', '5cbbf39f-c0b4-4034-9745-d1530e87e2fd'),
    ('b66b42f1-e8a7-4935-a8b5-22413b87ebcb', -500, 'Paying Mr Ndai for cutting the grass', 'null', 'Town house repairments', '5cbbf39f-c0b4-4034-9745-d1530e87e2fd'),
    ('1ad23ba6-e926-4e96-bf5c-a2860964e5bb', -200, 'Van''s petrol ', 'null', 'Town house repairments', '5cbbf39f-c0b4-4034-9745-d1530e87e2fd'),
    ('fb3b4f78-34bd-4f67-9d7d-5c3532fa3900', -225.9, 'OVK ', '1644764002443-proof.jpg', 'Town house repairments', '5cbbf39f-c0b4-4034-9745-d1530e87e2fd'),
    ('cade7a28-b680-45f7-88c5-cc7c118ffdeb', -42.4, 'Since mom was in Durban I was also buying food when we didn''t cook', '1644765508544-proof.jpg', 'Spar', '5cbbf39f-c0b4-4034-9745-d1530e87e2fd'),
    ('f896a981-8bb9-4669-bb07-f8abcbfbdbf5', -9.5, 'Bread', '1644765628889-proof.jpg', 'Spar', '5cbbf39f-c0b4-4034-9745-d1530e87e2fd'),
    ('0fcd104e-71f6-487d-a256-c96afc6c2070', -250, 'Paying Morena''s father for fixing the Dstv ', 'null', 'Dstv', '5cbbf39f-c0b4-4034-9745-d1530e87e2fd'),
    ('77894bc9-7d2a-4e38-85dd-f5107a2cd8af', -80, 'Paying Mr Shakes for installing the non return valve', 'null', 'Geyser', '5cbbf39f-c0b4-4034-9745-d1530e87e2fd'),
    ('e74506b9-d9a7-4e9d-8bbf-b0d5dfbfcc1a', -250, 'Money spent on petrol to go to welkom to buy the non-return valve ', '1644764380946-proof.jpg', 'Geyser', '5cbbf39f-c0b4-4034-9745-d1530e87e2fd'),
    ('9acd1562-4ab5-4f03-83b6-452d3fc08195', -102.58, 'Buying the non return valve for the geyser', '1644731689017-proof.jpg', 'Geyser', '5cbbf39f-c0b4-4034-9745-d1530e87e2fd'),
    ('cc223e07-01b4-41aa-97f4-f2ee3a1d016a', -500, 'Paying Boki''s ticket', 'null', 'Boki', '5cbbf39f-c0b4-4034-9745-d1530e87e2fd'),
    ('f727ffaf-3550-4793-8dc0-15f362bd8c5f', -100, 'Giving Boki the R100', 'null', 'Boki', '5cbbf39f-c0b4-4034-9745-d1530e87e2fd'),
    ('1bdf6007-4189-4e92-ae3d-d69e3591808d', -350, 'Paying Mr Mokgoke', 'null', 'Replacing brake pads', '56cdff75-a683-44bc-9272-2c4b793e5045'),
    ('5697db37-c4e9-40c2-ad27-abd3d0b7c787', -765, 'Buying brake pads', '1644757070972-proof.jpg', 'Replacing brake pads', '56cdff75-a683-44bc-9272-2c4b793e5045'),
    ('af1c62c8-875b-4e41-a99c-5b1702d9de43', -150, 'Buying petrol again after realisng that just buying R100 petrol made no difference ', '1644757105772-proof.jpg', 'Replacing brake pads', '56cdff75-a683-44bc-9272-2c4b793e5045'),
    ('1d1d665b-5f02-497e-aa27-3140e4722948', -100, 'Buying petrol in Welkom when i was there to buy brake pads', '1644757152539-proof.jpg', 'Replacing brake pads', '56cdff75-a683-44bc-9272-2c4b793e5045'),
    ('54a68430-57c7-45dd-9349-273378d910dd', -75, 'Buying the brake fluid', '1644757201312-proof.jpg', 'Replacing brake pads', '56cdff75-a683-44bc-9272-2c4b793e5045'),
    ('25b93c4e-ee1f-4c3e-9dad-bfef2475f984', -60, 'Buying paint brushes for Mr Ndai for when he was fixing the roof', '1644756783613-proof.jpg', 'Paint brushes', '56cdff75-a683-44bc-9272-2c4b793e5045'),
    ('1500ff08-153d-476f-b74a-e6c3c459b9f3', -350, 'Bank charges after the money was deposited', '1644757672732-proof.jpg', 'Bank charges', '56cdff75-a683-44bc-9272-2c4b793e5045')