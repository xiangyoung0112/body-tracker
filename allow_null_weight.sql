-- FitTrack: 放寬體重必填限制（支援純拍體態，體重選填）
ALTER TABLE public.weight_records ALTER COLUMN weight DROP NOT NULL;
