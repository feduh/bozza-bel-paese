DELETE FROM public.user_roles WHERE user_id = 'a0240c42-9865-4938-b08d-c8934175f3df';
DELETE FROM public.profiles WHERE user_id = 'a0240c42-9865-4938-b08d-c8934175f3df';
DELETE FROM auth.identities WHERE user_id = 'a0240c42-9865-4938-b08d-c8934175f3df';
DELETE FROM auth.users WHERE id = 'a0240c42-9865-4938-b08d-c8934175f3df';