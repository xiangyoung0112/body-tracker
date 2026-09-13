CREATE OR REPLACE FUNCTION public.handle_single_owner_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- 限制全專案只能有 1 個擁有者帳號。一旦擁有者註冊後，永久關閉公開註冊！
  IF (SELECT COUNT(*) FROM auth.users) >= 1 THEN
    RAISE EXCEPTION '註冊已全面關閉：此為私人保險箱，已有擁有者，禁止任何外部註冊。';
  END IF;
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
BEFORE INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_single_owner_signup();
