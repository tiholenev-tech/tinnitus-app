#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AURALIS — apply поетични БГ имена за всички 256 sounds в manifest.json
Автор: Шеф-Claude, 2026-05-27
Стил: премиум wellness, "напудрен", спа усещане
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "audio" / "library" / "manifest.json"
BACKUP = ROOT / "audio" / "library" / "manifest.backup.json"

# ============================================================
# 256 ПОЕТИЧНИ БГ ИМЕНА
# ============================================================
BG_TITLES = {
    # ============== OCEAN (41) ==============
    "ambience_air_inside_bunker_sea_ambience_from_outside_02": "Шепотът на дълбините",
    "ambience_residential_abandoned_building_gentle_wind_distant_boat_engine_distant_traffic_people_pass_by_helicopter_distant_sea_athens_greece": "Тих квартал в Атина",
    "ambience_seaside_dalian_beach_waves_people_footsteps_distant_boats_china": "Утро на брега",
    "ambience_underwater_sea_wave_ilo_aquatic_water_burble_waves_back_forth_microphone_blocking_feet": "Прегръдка на вълните",
    "ambience_underwater_waves_constant_deep_hits": "Сърцето на океана",
    "ambience_urban_black_sea_distant_waves_roar_condominium_neighborhod_black_sea_batumi_georgia_01": "Черноморски изгрев",
    "ambience_urban_black_sea_distant_waves_roar_condominium_neighborhod_black_sea_batumi_georgia_02": "Черноморска вечер",
    "ambience_urban_black_sea_distant_waves_roar_condominium_neighborhod_black_sea_batumi_georgia_03": "Тихият бряг на Батуми",
    "birds_sea_seagulls_distant_several_gentle_waves_02": "Чайки над брега",
    "genetic_waves_joseph_beg": "Безкрайните вълни",
    "ocean_meditation_joseph_beg": "Океан в дълбочина",
    "water_lap_waves_splashing_against_boat_large_hitting_sea_02": "Вълни при лодката",
    "water_lap_waves_water_lapping_seafront_sea_close": "Близкият морски бряг",
    "water_lap_waves_water_lapping_seafront_sea_semi_close": "Далечен прибой",
    "water_surf_beach_ocean_waves_sand_wind": "Песъчлив бряг",
    "water_surf_beach_waves_coming_in_occasional_birds_atlantic_ocean_caribbean_sea": "Карибски ритъм",
    "water_surf_distant_calm_sea_waves_few_distant_birds": "Спокойни далечини",
    "water_surf_ocean_sea_big_waves_breaking_against_dyke_breakwater_strong_weather_02_30": "Бурно море",
    "water_surf_water_ocean_seashore_waves_roar_distant_llandudno_cape_town_south_africa": "Африкански океан",
    "water_surf_water_sea_waves_choppy_italy_grado_01": "Италиански бряг",
    "water_surf_water_sea_waves_choppy_italy_grado_02": "Адриатически вълни",
    "water_surf_water_waves_rough_sea_01": "Бурни вълни",
    "water_surf_water_waves_rough_sea_02": "Развълнувано море",
    "water_surf_waves_bay_calm_waves_rocks_wash_evening_mediterranean_sea_selmun_bay_malta": "Малтийски залив",
    "water_surf_waves_bay_calm_waves_rocks_wash_evening_mediterranean_sea_selmun_bay_malta_01": "Вечер в Селмун",
    "water_surf_waves_ocean_distant_on_beach_distant_boat_motor_03": "Лодка в далечината",
    "water_underwater_deep_sea_bubbles_muffled_big_02": "Подводни мехури",
    "water_underwater_ocean_bubbles_water_movement_lapping_argentina_02": "Подводна Аржентина",
    "water_wave_ocean_beach_waves_medium_lapping": "Спокоен прилив",
    "water_wave_ocean_medium_waves_coming_in_close_03": "Близки вълни",
    "water_wave_ocean_wave_swells": "Дишащият океан",
    "water_wave_ocean_waves_medium_on_stone_sea_wall_boats_harbor_in_background": "Пристанищна вечер",
    "water_wave_ocean_waves_on_shore_beach_medium_distant": "Шум от брега",
    "water_wave_sea_beach_cove_100m_away_distance_moderate_waves_distant_plane_birds": "Усамотен залив",
    "water_wave_sea_beach_cove_50m_distance_moderate_waves_ms": "Тиха кота на брега",
    "water_wave_sea_light_wind_waves_intensifies": "Засилващи се вълни",
    "water_wave_sea_water_very_gentle_waves": "Нежно море",
    "water_wave_waves_sea_beach_punta_allen_sian_ka_an_biosphere_reserve_mexico": "Мексикански бряг",
    "wind_general_calm_mountain_sea_distant_waves_01": "Планина и море",
    "wind_general_calm_mountain_sea_distant_waves_02": "Морски бриз отвисоко",
    "wind_general_calm_mountain_sea_distant_waves_03": "Тих планински залив",

    # ============== RAIN (23) ==============
    "ambience_forest_ukraine_morning_birds_nature_trees_calm_breeze_wildlife": "Утрина в Карпатите",
    "ambience_swamp_wetland_after_rain_water_dripping_humid_distant_fowl": "След дъжда в блатата",
    "ambience_tropical_rain_texture_medium": "Тропическа песен",
    "ambience_underwater_grainy_bubbles_small_deep_fizz": "Шум на дълбините",
    "rain_attic_01": "Дъжд по покрива",
    "rain_cloth_raining_umbrella_01": "Капки по чадъра",
    "rain_concrete_city_rain_soft_residential_neighborhood_night_car_pass_by_wet_roads_side_streets_02": "Тиха градска вечер",
    "rain_general_medium_drip_details_night_wide": "Нощни капки",
    "rain_glass_rain_car_window_perspective_medium_01": "Дъжд по прозореца на колата",
    "rain_glass_window_roof_location_2_medium_room_loft_roof_window": "Капки над таванския прозорец",
    "rain_interior_rain_medium_drops_drumming_clunking": "Барабаненето на дъжда",
    "rain_interior_rain_medium_inside_car": "Дъждовна вечер в колата",
    "rain_interior_rain_on_window_house_apartment_room_tone_light_rain": "Дъжд в апартамента",
    "rain_plastic_medium_outside_plastic_window": "Дъжд по пластмасата",
    "rain_plastic_medium_to_light_outside_plastic_window": "Тих дъжд по прозореца",
    "rain_plastic_medium_to_light_under_plastic_roof_01": "Скривалище под покрива",
    "rain_plastic_medium_to_light_under_plastic_roof_02": "Сухо място в бурята",
    "rain_plastic_on_plastic_umbrella_medium_intensity_dense_dripping": "Гъст дъжд по чадъра",
    "rain_plastic_plastic_buckets_multiple_drops_medium_busy_01": "Капки в кофите",
    "rain_plastic_plastic_buckets_multiple_drops_medium_busy_02": "Многобройни капки",
    "rain_vegetation_medium_leaves_drop_tropical_jungle": "Дъжд в джунглата",
    "rain_wood_rain_front_porch_rain_on_door_medium": "Дъжд пред вратата",
    "wind_general_rain_playa_blanca_village_drops_metal_sheet_roof_movement_04": "Дъжд по тенекия",

    # ============== RIVER (33) ==============
    "ambience_forest_wetlands_river_water_wind_ship": "Река през гората",
    "ambience_underwater_bubbles_dark_spacious_boiling_flowing": "Кипяща дълбочина",
    "ambience_underwater_dark_deep_leak_gurgling_flowing": "Дълбоко гърголене",
    "ambience_underwater_dark_eerie_deep_bubbles_spacious_stream": "Мистична подводна река",
    "ambience_underwater_dark_eerie_spacious_flowing_roaring_01": "Подводен ритъм",
    "ambience_underwater_dark_eerie_spacious_flowing_roaring_02": "Тъмен поток",
    "ambience_underwater_gargle_river_flow_bubbles_water_telluride_usa_02": "Кристална планинска вода",
    "ambience_underwater_gargle_river_flow_bubbles_water_telluride_usa_03": "Бистра ледникова река",
    "ambience_underwater_gargle_river_flow_bubbles_water_telluride_usa_05": "Аметистова река",
    "ambience_underwater_river_flowing_01": "Тиха река",
    "ambience_underwater_river_flowing_02": "Бистра река",
    "ambience_underwater_river_flowing_03": "Спокойно течение",
    "ambience_underwater_river_flowing_04": "Кристален поток",
    "ambience_underwater_river_flowing_05": "Сребриста река",
    "ambience_underwater_river_flowing_06": "Прохладен поток",
    "ambience_underwater_trickle_bright_detailed_stream": "Светлинен поток",
    "ambience_underwater_water_flow_01": "Подводен танц",
    "ambience_underwater_water_flow_02": "Дълбок ритъм",
    "ambience_underwater_water_flow_03": "Безмълвен поток",
    "ambience_underwater_water_flow_04": "Тих воден ход",
    "rain_metal_rain_gutter_medium_drops_flowing": "Песен на улука",
    "water_flow_deep_mountain_stream_creek_bubble": "Дълбока планинска река",
    "water_flow_river_calm_running_medium_distance_01": "Спокойна река",
    "water_flow_river_close_gentle_01": "Нежно близко течение",
    "water_flow_river_close_gentle_02": "Кристалното шепнене",
    "water_flow_river_current_fast_distant": "Бързо далечно течение",
    "water_flow_river_current_small_fast_flow": "Бистра бързина",
    "water_flow_river_flow_strong_bubbles_nature_forest_telluride": "Силна горска река",
    "water_flow_river_run_flow_valley_bubbles_calm_nature_san_miguel_river_telluride": "Долината Сан Мигел",
    "water_flow_river_small_mountain_stream": "Малка планинска река",
    "water_waterfall_strong_flow_people_forest_lower_waterfall_evening_zenny_fall_telluride": "Водопад привечер",
    "water_waterfall_waterfall_medium_flow_01": "Тих водопад",
    "water_waterfall_waterfall_the_trolls_road_20m_from_river": "Тролският път",

    # ============== UNDERWATER (58) ==============
    "ambience_tropical_water_source_palm_leaves_wind_soothing": "Тропически извор",
    "ambience_underwater_active": "Подводен пулс",
    "ambience_underwater_complex_01": "Подводна симфония",
    "ambience_underwater_complex_02": "Тих подводен танц",
    "ambience_underwater_complex_03": "Подводна загадка",
    "ambience_underwater_complex_04": "Дълбоководна песен",
    "ambience_underwater_complex_05": "Подводен сън",
    "ambience_underwater_complex_06": "Тайно подводно място",
    "ambience_underwater_complex_07": "Подводна нежност",
    "ambience_underwater_complex_08": "Подводна тишина",
    "ambience_underwater_complex_09": "Безкрайни дълбини",
    "ambience_underwater_complex_10": "Подводен мир",
    "ambience_underwater_complex_evolving": "Развиващи се дълбини",
    "ambience_underwater_dark_eerie_roaring": "Тъмно подводно ехо",
    "ambience_underwater_dark_eerie_slow_moving_stutter": "Бавно потъващи звуци",
    "ambience_underwater_deep_01": "Великата дълбочина",
    "ambience_underwater_deep_02": "Тиха дълбочина",
    "ambience_underwater_deep_03": "Сребриста дълбочина",
    "ambience_underwater_deep_04": "Студена дълбочина",
    "ambience_underwater_deep_abstract_01": "Абстрактна дълбочина",
    "ambience_underwater_deep_abstract_02": "Сюрреалистична вода",
    "ambience_underwater_deep_abstract_03": "Подводна абстракция",
    "ambience_underwater_deep_abstract_04": "Тайнствено течение",
    "ambience_underwater_deep_bubble_01": "Дълбоки мехурчета",
    "ambience_underwater_deep_bubble_02": "Спокойни мехури",
    "ambience_underwater_deep_bubble_active_01": "Активни подводни мехури",
    "ambience_underwater_deep_bubble_active_02": "Танцуващи мехурчета",
    "ambience_underwater_deep_bubbles_01": "Мехурче по мехурче",
    "ambience_underwater_deep_bubbles_02": "Поток от мехурчета",
    "ambience_underwater_deep_bubbles_03": "Многобройни мехурчета",
    "ambience_underwater_deep_low": "Ниски дълбини",
    "ambience_underwater_deep_propeller": "Подводно моторче",
    "ambience_underwater_deep_sub": "Субмаринна тишина",
    "ambience_underwater_designed_subsonic_01": "Невидим бас",
    "ambience_underwater_designed_water_aquarium_bubbles_18": "Аквариумен ритъм",
    "ambience_underwater_designed_water_aquarium_bubbles_32": "Аквариумно мехурче",
    "ambience_underwater_distant_low_rumble_01": "Далечно подводно тътнене",
    "ambience_underwater_distant_low_rumble_02": "Дълбоко далечно ехо",
    "ambience_underwater_distant_mid_resonance_01": "Резонансно ехо",
    "ambience_underwater_distant_thrill_water_01": "Подводна тръпка",
    "ambience_underwater_distant_thrill_water_02": "Далечно водно вълнение",
    "ambience_underwater_near_machine_01": "Близка подводна машина",
    "ambience_underwater_near_machine_02": "Подводен механизъм",
    "ambience_underwater_small_bubbles_02": "Малки мехурчета",
    "ambience_underwater_submarine_underwater": "Под подводницата",
    "ambience_underwater_tub_underwater_loop": "Под повърхността",
    "ambience_underwater_underwater_current": "Подводно течение",
    "ambience_underwater_underwater_designed_flush_01": "Подводна вълна",
    "ambience_underwater_underwater_designed_running_03": "Подводен поток",
    "ambience_underwater_underwater_designed_running_04": "Тиха подводна песен",
    "ambience_underwater_underwater_drone_hum": "Подводен дрон",
    "ambience_underwater_waterfall": "Подводен водопад",
    "designed_drone_sub_deep_underwater": "Подсъзнателно течение",
    "water_bubbles_aqua_massage_bubbling_01": "Воден масаж",
    "water_bubbles_bubbling_witchs_cauldron": "Котелът на вещицата",
    "water_waterfall_large_waterfall_10_meters_constant_hum_mkh8040_40": "Великият водопад",
    "water_waterfall_steady_perspective": "Постоянен водопад",
    "water_waterfall_waterfall_powerful": "Мощен водопад",

    # ============== WIND (32) ==============
    "ambience_forest_winter_calm_light_wind_oslo_ostmarka_01": "Зимна осло-vska тишина",
    "ambience_forest_winter_calm_light_wind_single_bird_distant_oslo_ostmarka_01": "Самотна птица в зимата",
    "ambience_urban_oslo_urban_city_hall_strong_winds_rattling_no_people_distant_trams_traffic": "Осло на разсъмване",
    "wind_general_abandoned_factory_chimney_wind_gusts_light_whistling_mic_upwards_distant_traffic_hum_humberstone_chile": "Изоставена фабрика",
    "wind_general_desert_bushes_twigs_wind_gusts_light_electric_whistling": "Пустинни храсти",
    "wind_general_desert_close_to_bushes_wind_gusts_twig_branch_close": "Близки храсти в бриз",
    "wind_general_desert_light_whistling_bagdad_highway_wind_gusts_light_wind_bushes": "Багдад на хоризонта",
    "wind_general_desert_pampa_perdiz_wind_gusts_dark_02": "Тъмната пампа",
    "wind_general_desert_pampa_perdiz_wind_gusts_dark_03": "Патагонски бриз",
    "wind_general_high_cliff_alto_patache_chile_01": "Високите скали на Чили",
    "wind_general_iron_wire_sculpture_light_metallic_creaking_noise_wind_gusts_light_whistling_alto_patache_chile": "Желязна скулптура",
    "wind_general_large_tree_foliage_01": "Голямо дърво в листака",
    "wind_general_light_whistling_gusts_alto_patache_chile": "Тихо свирене в пустинята",
    "wind_general_light_wind_iron_wire_weather_station_barbed_wire_low_whistling_wind_gusts_alto_patache_chile": "Метеорологична станция",
    "wind_general_plastic_telescope_gusts_salar_atacama": "Телескопът в Атакама",
    "wind_general_rusty_antenna_howling_alto_patache_chile": "Ръждива антена",
    "wind_general_steady_wind_light_movement_cold": "Студен постоянен вятър",
    "wind_general_wilderness_medium_movement_cold_01": "Дива студенина",
    "wind_gust_cold_mountain_wind_gusts_varied_intensity_01": "Планински повеи",
    "wind_gust_distant_bush_light_whistling_valley": "Далечната долина",
    "wind_gust_salt_desert_salar_atacama_chile": "Солена пустиня",
    "wind_gust_whistling_garden_alto_patache_chile": "Свирещата градина",
    "wind_tonal_light_pole_whistling_wind_gusts_desert_alto_patache": "Светлинен стълб в пустинята",
    "wind_tonal_wind_howling_barbed_wire_fence_tierra_del_fuego_argentina_01": "Огнената земя",
    "wind_tonal_wind_whistling_distant_fog_collector_alto_patache": "Мъглата на Алто Патаче",
    "wind_tonal_wind_whistling_iron_fence_movement_wind_gusts_distant_city_hum_desert_outskirts_twentynine_palms": "Желязна ограда в нощта",
    "wind_vegetation_desert_wind_grass_blowing_in_wind_gusts_distant_traffic_hum_outskirts_01": "Тревичка в пустинния вятър",
    "wind_vegetation_desert_wind_grass_blowing_in_wind_gusts_distant_traffic_hum_outskirts_02": "Свободна пустинна трева",
    "wind_vegetation_desert_wind_grass_blowing_in_wind_gusts_distant_traffic_hum_outskirts_03": "Пустиня с далечно ехо",
    "wind_vegetation_mixed_forest_mountainside_gentle_wind_through_birches_pines_firs_spruces_distant_birds_40": "Бреза и бор в нежен вятър",
    "wind_vegetation_mixed_forest_mountainside_strong_wind_gusts_through_firs_birches_poplars_creaking_tree_40": "Скърцащи борове",
    "wind_vegetation_mixed_forest_wind_through_pines_birches_poplars_creaking_tree_trunk_leaves_rustling_bird_flyby_40": "Птичи преход през гората",

    # ============== MEDITATION (50) ==============
    "369_seconds_of_bliss_369": "Шест минути блаженство",
    "8_pm_anna_landstrom": "Осем часа вечерта",
    "a_calm_early_morning_rikard_from": "Спокойна сутрин",
    "angelica_instrumental_version_david_edward": "Ангелска мелодия",
    "archipelago_of_relaxation_mandala_dreams": "Архипелаг на спокойствието",
    "carried_by_current_valante": "Носен от течението",
    "celestial_spheres_ave_air": "Небесни сфери",
    "city_park_ave_air": "Градският парк",
    "crowned_with_spirit_valante": "Коронован с дух",
    "crystal_haze_shuta_yasukochi": "Кристална мъгла",
    "dharapani_dex_1200": "Дхарапани",
    "dusky_mirage_true_messenger": "Здрачен мираж",
    "end_of_rain_beyza": "Краят на дъжда",
    "enlightened_drift_amber_glow": "Просветлен дрейф",
    "epic_mirage_hanna_lindgren": "Епичен мираж",
    "field_of_horses_joseph_beg": "Полето на конете",
    "floating_sakura_petals_sayuri_hayashi_egnell": "Падащи сакура венчелистчета",
    "forest_breeze_ave_air": "Горски бриз",
    "gold_and_green_anna_landstrom": "Злато и зелено",
    "grounded_hanna_lindgren": "Заземяване",
    "healing_tides_amber_glow": "Лечебни приливи",
    "hush_my_darling_yi_nantiro": "Тих сън, любими",
    "inner_balance_elm_lake": "Вътрешен баланс",
    "kokoro_valante": "Сърцето",
    "komorebi_shuta_yasukochi": "Светлина през листата",
    "lullaby_for_kilian_magnus_ludvigsson": "Приспивна за Килиан",
    "meditation_aquatic_369": "Водна медитация",
    "mindstream_amber_glow": "Поток на мисълта",
    "mirror_of_the_heart_bladverk_band": "Огледалото на сърцето",
    "murmurations_hanna_lindgren": "Шепнене на стадото",
    "my_friend_the_warlock_bitwraith": "Моят приятел магьосникът",
    "namucuo_by_lotus": "Намуцуо",
    "on_a_knee_the_golden_peas": "На едно коляно",
    "parlemor_bomull": "Перленомайчин блясък",
    "pillars_of_resilience_cora_zea": "Стълбове на устойчивостта",
    "resonance_luba_hilman": "Резонанс на душата",
    "silver_woodlands_cora_zea": "Сребърни гори",
    "solitude_conscience_mandala_dreams": "Самотата на съвестта",
    "stargazing_shuta_yasukochi": "Звездно небе",
    "state_of_meditation_elm_lake": "Състояние на медитация",
    "still_love_hanna_lindgren": "Тиха любов",
    "the_hidden_realm_ruiqi_zhao": "Скритото царство",
    "the_lake_at_3am_mandala_dreams": "Езерото в три сутринта",
    "the_water_remains_rand_aldo": "Водата остава",
    "third_charm_joseph_beg": "Третото обаяние",
    "to_have_you_near_anna_landstrom": "Да те имам близо",
    "uninhabited_land_flouw": "Необитаема земя",
    "uphill_climbing_anna_landstrom": "Изкачване нагоре",
    "weightless_center_of_attention": "Безтегловност",
    "will_you_ever_know_anna_landstrom": "Дали ще разбереш",

    # ============== AMBIENT (8) ==============
    "ambience_scifi_eerie_alien_planet": "Извънземна планета",
    "ambience_underground_cave_dark_bubbles": "Тъмна пещера",
    "designed_drone_atmospheric_space_drone_tonal_rumble": "Космически дрон",
    "designed_drone_deep_bass": "Дълбок бас",
    "designed_rumble_low_sub_bass_moving_slowly": "Бавно движение",
    "designed_rumble_low_sub_slight_air": "Лек ветрец под нивото",
    "lay_down_with_me_hanna_lindgren": "Легни до мен",
    "opposite_to_destruction_hanna_lindgren": "Противоположност на разрухата",

    # ============== NOISE (6) — терапевтично точни ==============
    "brown_lowpass_1000": "Мек кафяв шум",
    "brown_lowpass_500": "Дълбок кафяв шум",
    "brown_pure": "Кафяв шум",
    "pink_lowpass_2000": "Мек розов шум",
    "pink_lowpass_4000": "Розов шум",
    "pink_pure": "Чист розов шум",

    # ============== FOREST (4) ==============
    "ambience_forest_wetlands_forest_birds_birdsong": "Песни на горските птици",
    "ambience_forest_wetlands_snowing_droplets_distant": "Сняг и далечни капки",
    "ambience_forest_wetlands_winter_wildlife_birds": "Зимна гора",
    "ambience_nautical_wetlands_distant_factory_birds_01": "Далечни птици край водата",

    # ============== FIRE (1) ==============
    "fire_burning_fireplace_glass_front_wood_burning_medium": "Огнището у дома",
}


def main():
    # 1. Backup първо
    if not BACKUP.exists():
        print(f"📦 Създавам backup: {BACKUP.name}")
        BACKUP.write_text(MANIFEST.read_text(encoding="utf-8"), encoding="utf-8")
    else:
        print(f"✓ Backup вече съществува: {BACKUP.name}")

    # 2. Load manifest
    m = json.loads(MANIFEST.read_text(encoding="utf-8"))
    sounds = m.get("sounds", m) if isinstance(m, dict) else m
    print(f"📂 Зареден manifest: {len(sounds)} sounds")

    # 3. Проверка на coverage
    manifest_ids = {s.get("id") for s in sounds}
    mapping_ids = set(BG_TITLES.keys())

    missing_in_mapping = manifest_ids - mapping_ids
    extra_in_mapping = mapping_ids - manifest_ids

    if missing_in_mapping:
        print(f"\n⚠ {len(missing_in_mapping)} sounds в manifest но НЯМАТ име в mapping-а:")
        for sid in sorted(missing_in_mapping)[:10]:
            print(f"   - {sid}")
        if len(missing_in_mapping) > 10:
            print(f"   ... и още {len(missing_in_mapping) - 10}")

    if extra_in_mapping:
        print(f"\n⚠ {len(extra_in_mapping)} имена в mapping но НЯМАТ sound в manifest:")
        for sid in sorted(extra_in_mapping)[:10]:
            print(f"   - {sid}")

    # 4. Уникалност
    titles = list(BG_TITLES.values())
    from collections import Counter
    duplicates = {t: c for t, c in Counter(titles).items() if c > 1}
    if duplicates:
        print(f"\n⚠ Дублирани имена ({len(duplicates)}):")
        for t, c in duplicates.items():
            print(f"   '{t}' × {c}")

    # 5. Apply
    updated = 0
    not_found = 0
    for s in sounds:
        sid = s.get("id")
        if sid in BG_TITLES:
            s["bg_title"] = BG_TITLES[sid]
            updated += 1
        else:
            not_found += 1

    # 6. Save
    MANIFEST.write_text(
        json.dumps(m, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    print(f"\n✅ Updated: {updated} sounds")
    if not_found:
        print(f"⚠ Без mapping (запазват старо bg_title): {not_found}")
    print(f"💾 Записано в: {MANIFEST}")
    print(f"\n🎯 Готово! Прегледай 5-10 случайни sounds в app-а.")


if __name__ == "__main__":
    main()
