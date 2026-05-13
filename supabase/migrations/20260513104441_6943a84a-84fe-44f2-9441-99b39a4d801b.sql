
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
    confirmation_token, email_change, email_change_token_new, email_change_token_current,
    recovery_token, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', new_user_id,
    'authenticated', 'authenticated',
    'author@test.it', crypt('authorauthor', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    false, false, '', '', '', '', '', '', '', ''
  );

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (
    gen_random_uuid(), new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', 'author@test.it', 'email_verified', true),
    'email', new_user_id::text, now(), now(), now()
  );

  INSERT INTO public.profiles (user_id, display_name, bio, reality_id)
  VALUES (new_user_id, 'Autore Esempio', 'Membro di Collettivo Aurora, scrive sul magazine.', 'a1000000-0000-0000-0000-000000000001');

  INSERT INTO public.user_roles (user_id, role) VALUES (new_user_id, 'author');
END $$;
