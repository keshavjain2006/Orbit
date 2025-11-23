-- Run this in the Supabase SQL Editor to update your database

-- 1. Add locations column to encounters table
ALTER TABLE public.encounters 
ADD COLUMN IF NOT EXISTS locations jsonb DEFAULT '[]'::jsonb;

-- 2. Update the View to include locations
DROP VIEW IF EXISTS my_orbit_feed;

CREATE OR REPLACE VIEW my_orbit_feed AS
SELECT
    e.id AS encounter_id,
    CASE WHEN e.user_a = auth.uid() THEN e.user_b ELSE e.user_a END AS other_user_id,
    p.username AS other_username,
    p.avatar_url AS other_avatar,
    p.bio AS other_bio,
    p.beacon_id AS other_beacon_id,
    e.meet_count,
    e.last_met_at,
    e.is_matched,
    e.locations, -- Include locations in the view
    CASE WHEN e.user_a = auth.uid() THEN e.waved_a ELSE e.waved_b END AS have_i_waved,
    CASE WHEN e.user_a = auth.uid() THEN e.waved_b ELSE e.waved_a END AS has_waved_at_me
FROM public.encounters e
JOIN public.profiles p ON p.id = (CASE WHEN e.user_a = auth.uid() THEN e.user_b ELSE e.user_a END)
WHERE e.user_a = auth.uid() OR e.user_b = auth.uid();

-- 3. Update the scan_beacon function to accept and store location
CREATE OR REPLACE FUNCTION scan_beacon(target_beacon_id text, lat float DEFAULT NULL, long float DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  existing_encounter_id bigint;
  new_count int;
  new_location jsonb;
BEGIN
  -- 1. Find the user with this beacon_id
  SELECT id INTO target_user_id FROM public.profiles WHERE beacon_id = target_beacon_id;

  IF target_user_id IS NULL THEN
    RETURN json_build_object('status', 'unknown_beacon');
  END IF;

  IF target_user_id = auth.uid() THEN
    RETURN json_build_object('status', 'ignored_self');
  END IF;

  -- Prepare location object
  IF lat IS NOT NULL AND long IS NOT NULL THEN
    new_location := json_build_object('lat', lat, 'long', long, 'timestamp', now());
  ELSE
    new_location := NULL;
  END IF;

  -- 2. Check if encounter exists
  SELECT id, meet_count INTO existing_encounter_id, new_count 
  FROM public.encounters 
  WHERE (user_a = auth.uid() AND user_b = target_user_id) 
     OR (user_a = target_user_id AND user_b = auth.uid());

  IF existing_encounter_id IS NOT NULL THEN
    -- Update existing
    UPDATE public.encounters 
    SET meet_count = meet_count + 1, 
        last_met_at = now(),
        locations = CASE 
            WHEN new_location IS NOT NULL THEN locations || new_location 
            ELSE locations 
        END
    WHERE id = existing_encounter_id;
    RETURN json_build_object('status', 'success', 'count', new_count + 1);
  ELSE
    -- Create new
    INSERT INTO public.encounters (user_a, user_b, meet_count, locations)
    VALUES (auth.uid(), target_user_id, 1, CASE WHEN new_location IS NOT NULL THEN json_build_array(new_location) ELSE '[]'::jsonb END);
    RETURN json_build_object('status', 'success', 'count', 1);
  END IF;
END;
$$;
