UPDATE auth.users
SET encrypted_password = crypt('coordcoord', gen_salt('bf')),
    updated_at = now()
WHERE email = 'coordinatore@test.it';