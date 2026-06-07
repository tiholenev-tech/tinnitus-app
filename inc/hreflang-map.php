<?php
/**
 * AURALIS - централна карта на hreflang клъстерите за статиите.
 * Ключ: каноничният BG URL на статията. Стойност: преводните URL-и.
 * Ползва се от inc/article-template{,-it,-ro}.php за авто-hreflang в <head>.
 * Поддръжка: при нов език добави ключа тук (една точка на истина).
 */
$HREFLANG_CLUSTERS = [
  'https://tinnitus-app.help/articles/bimodalna-neuromodulatsiya.php' => ['it' => 'https://tinnitus-app.help/it/articoli/neuromodulazione-bimodale-acufene.php', 'ro' => 'https://tinnitus-app.help/ro/articole/neuromodulare-bimodala-tinitus.php'],
  'https://tinnitus-app.help/articles/buchene-noshtem-ne-moga-da-zaspya.php' => ['it' => 'https://tinnitus-app.help/it/articoli/non-riesco-a-dormire-acufene.php', 'ro' => 'https://tinnitus-app.help/ro/articole/nu-pot-dormi-tinitus.php'],
  'https://tinnitus-app.help/articles/depresiya-i-tinitus.php' => ['it' => 'https://tinnitus-app.help/it/articoli/acufene-e-depressione.php', 'ro' => 'https://tinnitus-app.help/ro/articole/tinitus-si-depresie.php'],
  'https://tinnitus-app.help/articles/dnevnik-na-sana-i-tinitusa.php' => ['it' => 'https://tinnitus-app.help/it/articoli/diario-sonno-acufene.php', 'ro' => 'https://tinnitus-app.help/ro/articole/jurnal-somn-tinitus.php'],
  'https://tinnitus-app.help/articles/kafe-alkohol-tinitus.php' => ['it' => 'https://tinnitus-app.help/it/articoli/caffe-alcol-acufene.php', 'ro' => 'https://tinnitus-app.help/ro/articole/cafea-alcool-tinitus.php'],
  'https://tinnitus-app.help/articles/lekarstva-prichinyavasht-tinitus.php' => ['it' => 'https://tinnitus-app.help/it/articoli/farmaci-che-causano-acufene.php', 'ro' => 'https://tinnitus-app.help/ro/articole/medicamente-care-cauzeaza-tinitus.php'],
  'https://tinnitus-app.help/articles/magneziy-ginko-tsink-tinitus.php' => ['it' => 'https://tinnitus-app.help/it/articoli/magnesio-ginkgo-zinco-acufene.php', 'ro' => 'https://tinnitus-app.help/ro/articole/magneziu-ginkgo-zinc-tinitus.php'],
  'https://tinnitus-app.help/articles/maskirane-vs-notched.php' => ['it' => 'https://tinnitus-app.help/it/articoli/mascheramento-vs-notched.php', 'ro' => 'https://tinnitus-app.help/ro/articole/mascare-vs-notched.php'],
  'https://tinnitus-app.help/articles/mindfulness-pri-tinitus.php' => ['it' => 'https://tinnitus-app.help/it/articoli/mindfulness-acufene.php', 'ro' => 'https://tinnitus-app.help/ro/articole/mindfulness-tinitus.php'],
  'https://tinnitus-app.help/articles/notched-zvukova-terapiya.php' => ['it' => 'https://tinnitus-app.help/it/articoli/terapia-del-suono-notched.php', 'ro' => 'https://tinnitus-app.help/ro/articole/terapia-sonora-notched.php'],
  'https://tinnitus-app.help/articles/opasen-li-e-shumat-v-ushite.php' => ['it' => 'https://tinnitus-app.help/it/articoli/il-rumore-mi-danneggia-udito.php', 'ro' => 'https://tinnitus-app.help/ro/articole/tinitus-periculos-auz.php'],
  'https://tinnitus-app.help/articles/pulsirasht-shum-v-ushite.php' => ['it' => 'https://tinnitus-app.help/it/articoli/acufene-pulsante.php', 'ro' => 'https://tinnitus-app.help/ro/articole/tinitus-pulsatil.php'],
  'https://tinnitus-app.help/articles/shte-oglusheya-li-ot-tinitus.php' => ['it' => 'https://tinnitus-app.help/it/articoli/diventero-sordo-acufene.php', 'ro' => 'https://tinnitus-app.help/ro/articole/voi-surzi-din-tinitus.php'],
  'https://tinnitus-app.help/articles/shum-v-ushite-noshtem.php' => ['it' => 'https://tinnitus-app.help/it/articoli/fischio-nelle-orecchie.php', 'ro' => 'https://tinnitus-app.help/ro/articole/tiuit-in-urechi.php'],
  'https://tinnitus-app.help/articles/sluhovi-aparati-tinitus.php' => ['it' => 'https://tinnitus-app.help/it/articoli/apparecchi-acustici-acufene.php', 'ro' => 'https://tinnitus-app.help/ro/articole/aparate-auditive-tinitus.php'],
  'https://tinnitus-app.help/articles/tinitus-i-san.php' => ['it' => 'https://tinnitus-app.help/it/articoli/acufene-di-notte.php', 'ro' => 'https://tinnitus-app.help/ro/articole/tinitus-noaptea.php'],
  'https://tinnitus-app.help/articles/trevozhnost-i-tinitus.php' => ['it' => 'https://tinnitus-app.help/it/articoli/ansia-e-acufene.php', 'ro' => 'https://tinnitus-app.help/ro/articole/anxietate-si-tinitus.php'],
  'https://tinnitus-app.help/articles/tservikalen-tinitus-shiya.php' => ['it' => 'https://tinnitus-app.help/it/articoli/acufene-e-cervicale.php', 'ro' => 'https://tinnitus-app.help/ro/articole/tinitus-si-cervicala.php'],
  'https://tinnitus-app.help/articles/zaglahnali-ushi-pod-voda.php' => ['it' => 'https://tinnitus-app.help/it/articoli/orecchie-ovattate.php', 'ro' => 'https://tinnitus-app.help/ro/articole/urechi-infundate.php'],
  'https://tinnitus-app.help/articles/zvukove-pri-tinitus.php' => ['it' => 'https://tinnitus-app.help/it/articoli/quali-suoni-per-acufene.php', 'ro' => 'https://tinnitus-app.help/ro/articole/ce-sunete-pentru-tinitus.php'],
];

/** Връща превода (it/ro) за даден каноничен BG URL, или празен масив. */
function hreflang_alts($bgUrl) {
  global $HREFLANG_CLUSTERS;
  return $HREFLANG_CLUSTERS[$bgUrl] ?? [];
}
