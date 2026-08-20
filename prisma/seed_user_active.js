const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const rawCsvData = `
"id";"sku";"modelo";"categoria";"marca";"capacidad";"precio_costo";"precio_mayorista";"precio_detallista";"precio_minimo";"notas";"status";"en_lista_activa";"orden_lista"
"ALCATEL-3L-2+64GB";"";"3L";"Celulares";"ALCATEL";"2+64GB";"0";"0";"3600";"";"";"ACTIVE";"false";"65"
"ALCATEL-A31-PRIME-4+128GB";"";"A31 PRIME";"Celulares";"ALCATEL";"4+128GB";"0";"0";"4500";"";"";"ACTIVE";"false";"0"
"BICICLETAS-CARGO-60K/H";"";"CARGO";"Celulares";"BICICLETAS";"60K/H";"0";"0";"35500";"";"";"ACTIVE";"true";"0"
"BICICLETAS-E1-40K/H";"";"E1";"Celulares";"BICICLETAS";"40K/H";"0";"0";"23100";"";"";"ACTIVE";"false";"0"
"BLU-BOLD-K2-4+64GB";"";"BOLD K2";"Celulares";"BLU";"4+64GB";"0";"0";"3800";"";"";"ACTIVE";"false";"0"
"BLU-BOLD-K20--4+256GB";"";"BOLD K20 ";"Celulares";"BLU";"4+256GB";"0";"0";"5500";"";"";"ACTIVE";"false";"0"
"BLU-BOLD-K30-6+256GB";"";"BOLD K30";"Celulares";"BLU";"6+256GB";"0";"0";"5900";"";"";"ACTIVE";"false";"0"
"BLU-C5L-MAX--2+16GB";"";"C5L MAX ";"Celulares";"BLU";"2+16GB";"0";"0";"1600";"";"";"ACTIVE";"true";"37"
"BLU-C5L-PLUS--2RAM-16GB";"";"C5L PLUS";"Celulares";"BLU";"2+6GB";"0";"0";"1600";"";"";"ACTIVE";"true";"33"
"BLU-C5L-PLUS--2+16GB";"";"C5L PLUS ";"Celulares";"BLU";"2+16GB";"0";"0";"1600";"";"";"ACTIVE";"true";"53"
"BLU-C9-2+64GB";"";"C9";"Celulares";"BLU";"2+64GB";"0";"0";"3900";"";"";"ACTIVE";"true";"38"
"BLU-G33-2+16GB";"";"G33";"Celulares";"BLU";"2+16GB";"0";"0";"2400";"";"";"ACTIVE";"true";"50"
"BLU-G33-2+32GB";"";"G33";"Celulares";"BLU";"2+32GB";"0";"0";"2400";"";"";"ACTIVE";"false";"71"
"BLU-G45--4+128GB";"";"G45";"Celulares";"BLU";"4+128GB";"0";"0";"5500";"";"";"ACTIVE";"true";"27"
"BLU-G64--4+256GB";"";"G64";"Celulares";"BLU";"4+256GB";"0";"0";"5800";"";"";"ACTIVE";"true";"58"
"BLU-G75-4+256GB";"";"G75";"Celulares";"BLU";"4+256GB";"0";"0";"6600";"";"";"ACTIVE";"true";"35"
"BLU-J6L--2+16GB";"";"J6L ";"Celulares";"BLU";"2+16GB";"0";"0";"2500";"";"";"ACTIVE";"true";"29"
"BLU-J8L-2+16GB";"";"J8L";"Celulares";"BLU";"2+16GB";"0";"0";"1600";"";"";"ACTIVE";"true";"43"
"BLU-K10--4+8RAM-128GB";"";"K10";"Celulares";"BLU";"4+128GB";"0";"0";"4800";"";"";"ACTIVE";"false";"65"
"BLU-K12--4+128GB";"";"K12 ";"Celulares";"BLU";"4+128GB";"0";"0";"4900";"";"";"ACTIVE";"true";"26"
"BLU-K2--4+64GB";"";"K2";"Celulares";"BLU";"4+64GB";"0";"0";"4400";"";"";"ACTIVE";"true";"28"
"BLU-K30--6+256GB";"";"K30 ";"Celulares";"BLU";"6+256GB";"0";"0";"5900";"";"";"ACTIVE";"true";"25"
"BLU-STUDIO-X5-MAX-2+16GB";"";"STUDIO X5 MAX";"Celulares";"BLU";"2+16GB";"0";"0";"1800";"";"";"ACTIVE";"true";"44"
"COOLPAD-CP12-NEO-4+128GB";"";"CP12 NEO";"Celulares";"COOLPAD";"4+128GB";"0";"0";"4700";"";"";"ACTIVE";"true";"1"
"ITEL-A100C-3+128GB";"";"A100C";"Celulares";"ITEL";"3+128GB";"0";"0";"4700";"";"";"ACTIVE";"true";"18"
"ITEL-A100C-3+64GB";"";"A100C";"Celulares";"ITEL";"3+64GB";"0";"0";"4200";"";"";"ACTIVE";"true";"19"
"ITEL-A100CS-8+128GB";"";"A100CS";"Celulares";"ITEL";"8+128GB";"0";"0";"4900";"";"";"ACTIVE";"true";"9"
"KARGAMAX-CABECITA-65W";"";"CABECITA";"Celulares";"KARGAMAX";"65W";"0";"0";"1050";"";"";"ACTIVE";"false";"0"
"KARGAMAX-SONI2-AIRPOD-PRO";"";"SONI2 AIRPOD";"Celulares";"KARGAMAX";"PRO";"0";"0";"750";"";"";"ACTIVE";"false";"0"
"M-HORSE-M16-PRO-MAX-8+128GB";"";"M16 PRO MAX";"Celulares";"M-HORSE";"8+128GB";"0";"0";"4600";"";"";"ACTIVE";"false";"0"
"M-HORSE-M16-PRO-MAX---4+64GB";"";"M16 PRO MAX ";"Celulares";"M-HORSE";" 4+64GB";"0";"0";"4700";"";"";"ACTIVE";"false";"0"
"M-HORSE-M17-PRO-4+64GB";"";"M17 PRO";"Celulares";"M-HORSE";"4+64GB";"0";"0";"4850";"";"";"ACTIVE";"true";"56"
"M-HORSE-M17-PRO-MAX--8+128GB";"";"M17 PRO MAX ";"Celulares";"M-HORSE";"8+128GB";"0";"0";"5950";"";"";"ACTIVE";"true";"31"
"M-HORSE-NOTE-14-PRO-PLUS-ULTRA--8+128GB";"";"NOTE 14 PRO PLUS ULTRA ";"Celulares";"M-HORSE";"8+128GB";"0";"0";"5600";"";"";"ACTIVE";"true";"22"
"M-HORSE-NOTE-15-PRO-PLUS--4+64GB";"";"NOTE 15 PRO PLUS ";"Celulares";"M-HORSE";"4+64GB";"0";"0";"4850";"";"";"ACTIVE";"false";"0"
"M-HORSE-S25-PRO-MAX-ULTRA-8+128GB";"";"S25 PRO MAX ULTRA";"Celulares";"M-HORSE";"8+128GB";"0";"0";"5200";"";"";"ACTIVE";"false";"0"
"M-HORSE-S25-PRO-PLUS--6+64GB";"";"S25 PRO PLUS ";"Celulares";"M-HORSE";"6+64GB";"0";"0";"4600";"";"";"ACTIVE";"false";"0"
"M-HORSE-S26-ULTRA-MAX--8+64GB";"";"S26 ULTRA MAX";"Celulares";"M-HORSE";" 8+64GB";"0";"0";"4900";"";"";"ACTIVE";"true";"32"
"M-HORSE-S26-ULTRA-MAX-PLUS-6+128GB";"";"S26 ULTRA MAX PLUS";"Celulares";"M-HORSE";"6+128GB";"0";"0";"5750";"";"";"ACTIVE";"true";"45"
"MOTOROLA-EDGE-60-FUSION--4+256GB";"";"EDGE 60 FUSION ";"Celulares";"MOTOROLA";"4+256GB";"0";"0";"15900";"";"";"ACTIVE";"false";"0"
"MOTOROLA-G06--4+256GB";"";"G06";"Celulares";"MOTOROLA";"4+256GB";"0";"0";"8800";"";"";"ACTIVE";"true";"20"
"MOTOROLA-G06-4+64GB";"";"G06";"Celulares";"MOTOROLA";"4+64GB";"0";"0";"6200";"";"";"ACTIVE";"true";"46"
"MOTOROLA-G06-4+128GB";"";"G06";"Celulares";"MOTOROLA";"4+128GB";"0";"0";"7200";"";"";"ACTIVE";"true";"54"
"cmsrn1jiq000004kzn8ojhh3b";"";"G06 EU";"Celulares";"MOTOROLA";"4+64GB";"0";"0";"5500";"";"";"ACTIVE";"true";"57"
"MOTOROLA-G15--4+128GB";"";"G15";"Celulares";"MOTOROLA";"4+128GB";"0";"0";"7200";"";"";"ACTIVE";"true";"21"
"MOTOROLA-G15-4+256GB";"";"G15";"Celulares";"MOTOROLA";"4+256GB";"0";"0";"7000";"";"";"ACTIVE";"false";"0"
"MOTOROLA-G15--4+512GB";"";"G15 ";"Celulares";"MOTOROLA";"4+512GB";"0";"0";"9000";"";"";"ACTIVE";"false";"16"
"MOTOROLA-G56-8+256GB";"";"G56";"Celulares";"MOTOROLA";"8+256GB";"0";"0";"11300";"";"";"ACTIVE";"false";"0"
"OUKITEL-C1--4+128GB";"";"C1 ";"Celulares";"OUKITEL";"4+128GB";"0";"0";"5600";"";"";"ACTIVE";"false";"0"
"OUKITEL-C26--4+128GB";"";"C26 ";"Celulares";"OUKITEL";"4+128GB";"0";"0";"5950";"";"";"ACTIVE";"false";"40"
"OUKITEL-C61-4+128GB";"";"C61";"Celulares";"OUKITEL";"4+128GB";"0";"0";"6400";"";"";"ACTIVE";"false";"0"
"OUKITEL-C61-GT-4+128GB-4+128GB";"";"C61  GT";"Celulares";"OUKITEL";"4+128GB";"0";"0";"6600";"";"";"ACTIVE";"true";"36"
"OUKITEL-C61-PRO--8+16RAM-256GB";"";"C61 PRO";"Celulares";"OUKITEL";"8+256GB";"0";"0";"7700";"";"";"ACTIVE";"false";"64"
"OUKITEL-C62--4+128GB";"";"C62 ";"Celulares";"OUKITEL";"4+128GB";"0";"0";"7000";"";"";"ACTIVE";"true";"30"
"OUKITEL-C62-PRO-8+16-256GB";"";"C62 PRO";"Celulares";"OUKITEL";"8+16 256GB";"0";"0";"8400";"";"";"ACTIVE";"false";"0"
"cmstg37fl000804l2sumfk3vx";"";"G3";"Celulares";"OUKITEL";"4+256GB";"0";"0";"7900";"";"";"ACTIVE";"true";"61"
"OUKITEL-G3-4+64GB";"";"G3";"Celulares";"OUKITEL";"4+64GB";"0";"0";"5600";"";"";"ACTIVE";"false";"0"
"OUKITEL-G6--4+64GB";"";"G6";"Celulares";"OUKITEL";" 4+64GB";"0";"0";"7750";"";"";"ACTIVE";"true";"65"
"OUKITEL-G6-4-4+128GB";"";"G6";"Celulares";"OUKITEL";"4+128GB";"0";"0";"9100";"";"";"ACTIVE";"true";"55"
"OUKITEL-G6--8+256GB";"";"G6 ";"Celulares";"OUKITEL";"8+256GB";"0";"0";"10500";"";"";"ACTIVE";"true";"66"
"OUKITEL-G7--8+256GB-";"";"G7 ";"Celulares";"OUKITEL";"8+256GB ";"0";"0";"10600";"";"";"ACTIVE";"false";"0"
"OUKITEL-WP200-PRO--24+1TB";"";"WP200 PRO ";"Celulares";"OUKITEL";"24+1TB";"0";"0";"31800";"";"";"ACTIVE";"false";"0"
"cmstj317f000004ldl6rqde89";"";"WP23 PLUS";"Celulares";"OUKITEL";"8+256GB";"0";"0";"10200";"";"";"ACTIVE";"true";"63"
"OUKITEL-WP28E--4+64GB";"";"WP28E";"Celulares";"OUKITEL";"4+64GB";"0";"0";"7650";"";"";"ACTIVE";"true";"62"
"cmstfmam5000304ju5gdjpqib";"";"WP28E";"Celulares";"OUKITEL";"4+12RAM 64GB";"0";"0";"0";"";"";"ACTIVE";"false";"63"
"OUKITEL-WP300--12+512GB";"";"WP300 ";"Celulares";"OUKITEL";"12+512GB";"0";"0";"21500";"";"";"ACTIVE";"false";"0"
"cmstfp6yc000604l6ngns9stl";"";"WP53 PRO";"Celulares";"OUKITEL";"8+256GB";"0";"0";"10900";"";"";"ACTIVE";"true";"60"
"OUKITEL-WP53S-16+128GB";"";"WP53S";"Celulares";"OUKITEL";"4+128GB";"0";"0";"9400";"";"";"ACTIVE";"true";"64"
"OUKITEL-WP56--8+256GB";"";"WP56 ";"Celulares";"OUKITEL";"8+256GB";"0";"0";"15800";"";"";"ACTIVE";"false";"0"
"OUKITEL-WP60--8+256GB";"";"WP60 ";"Celulares";"OUKITEL";"8+256GB";"0";"0";"15800";"";"";"ACTIVE";"false";"0"
"OUKITEL-WP60--16+512GB";"";"WP60 ";"Celulares";"OUKITEL";"16+512GB";"0";"0";"21000";"";"";"ACTIVE";"false";"0"
"OUKITEL-WP61-PLUS--12+512GB";"";"WP61 PLUS ";"Celulares";"OUKITEL";"12+512GB";"0";"0";"23500";"";"";"ACTIVE";"false";"0"
"OUKITEL-WP66--12+512GB-";"";"WP66 ";"Celulares";"OUKITEL";"12+512GB ";"0";"0";"19800";"";"";"ACTIVE";"false";"0"
"SAMSUNG-A06-4+64GB";"";"A06";"Celulares";"SAMSUNG";"4+64GB";"0";"0";"5600";"";"";"ACTIVE";"false";"0"
"SAMSUNG-A07-4+64GB";"";"A07";"Celulares";"SAMSUNG";"4+64GB";"0";"0";"6000";"";"";"ACTIVE";"true";"47"
"SAMSUNG-A07-4+128GB-";"";"A07";"Celulares";"SAMSUNG";"4+128GB ";"0";"0";"6300";"";"";"ACTIVE";"false";"0"
"SAMSUNG-A16-4+128GB";"";"A16";"Celulares";"SAMSUNG";"4+128GB";"0";"0";"8200";"";"";"ACTIVE";"true";"51"
"SAMSUNG-A17-6+128GB";"";"A17";"Celulares";"SAMSUNG";"6+128GB";"0";"0";"10400";"";"";"ACTIVE";"false";"60"
"SAMSUNG-A17-4+128GB";"";"A17";"Celulares";"SAMSUNG";"4+128GB";"0";"0";"9400";"";"";"ACTIVE";"true";"59"
"SAMSUNG-TV-U7900FD-65""";"";"TV U7900FD";"Celulares";"SAMSUNG";"65""";"0";"0";"34000";"";"";"ACTIVE";"false";"0"
"SUNELAN-MONTAIN-M8-4+128GB";"";"MONTAIN M8";"Celulares";"SUNELAN";"4+128GB";"0";"0";"4800";"";"";"ACTIVE";"true";"7"
"SUNELAN-SUNTAK-PORTO-2+16GB";"";"SUNTAK PORTO";"Celulares";"SUNELAN";"2+16GB";"0";"0";"1100";"";"";"ACTIVE";"true";"11"
"cmsxe9ijs000104jmwm95so5d";"";"MAXWEST ASTRO 10R";"Celulares";"TABLETA";"3+32GB";"0";"0";"5200";"";"";"ACTIVE";"false";"69"
"TABLETAS-AMAZON--13-TH-GEN-3+32GB";"";"AMAZON ";"Celulares";"TABLETAS";"13 TH GEN  3+32GB";"0";"0";"4400";"";"";"ACTIVE";"true";"34"
"cmsxea9cj000104lchx4j1oeh";"";"ASTRO 10R";"Celulares";"TABLETAS";"3+32GB";"0";"0";"5200";"";"";"ACTIVE";"true";"68"
"TABLETAS-LG-GPAD5--32GB";"";"LG GPAD5 ";"Celulares";"TABLETAS";"32GB";"0";"0";"3500";"";"";"ACTIVE";"false";"0"
"cmsxed36y000204jrdlv4dqg8";"";"M-HORSE PAD 17";"Celulares";"TABLETAS";"4+32GB";"0";"0";"5400";"";"";"ACTIVE";"true";"69"
"TABLETAS-OTUXONE-SHOOLTAB--1-32GB";"";"OTUXONE SHOOLTAB ";"Celulares";"TABLETAS";"1 32GB";"0";"0";"4800";"";"";"ACTIVE";"true";"14"
"TABLETAS-REVVL-TAB--5G-128GB";"";"REVVL TAB";"Celulares";"TABLETAS";" 5G 128GB";"0";"0";"5000";"";"";"ACTIVE";"false";"0"
"TABLETAS-SAMSUNG-TAB-8A-32GB";"";"SAMSUNG TAB 8A";"Celulares";"TABLETAS";"32GB";"0";"0";"0";"";"";"ACTIVE";"false";"0"
"TABLETAS-SAMSUNG-TAB-A2020--8.4""-32GB";"";"SAMSUNG TAB A2020 ";"Celulares";"TABLETAS";"8.4""  32GB";"0";"0";"4000";"";"";"ACTIVE";"false";"0"
"TABLETAS-TCL-TAB-8LE-9137W--32GB";"";"TCL TAB 8LE 9137W ";"Celulares";"TABLETAS";"32GB";"0";"0";"2000";"";"";"ACTIVE";"false";"0"
"TCL-503-4+64GB";"";"503";"Celulares";"TCL";"3+64GB";"0";"0";"4400";"";"";"ACTIVE";"false";"65"
"TCL-503-3+128GB";"";"503";"Celulares";"TCL";"3+128GB";"0";"0";"5300";"";"";"ACTIVE";"true";"6"
"TECNO-40C-8+256GB";"";"40C";"Celulares";"TECNO";"8+256GB";"0";"0";"7700";"";"";"ACTIVE";"false";"0"
"TECNO-GO-2-3+64GB";"";"GO 2";"Celulares";"TECNO";"3+64GB";"0";"0";"4900";"";"";"ACTIVE";"false";"0"
"TECNO-GO-2-4+128GB";"";"GO 2";"Celulares";"TECNO";"4+128GB";"0";"0";"5600";"";"";"ACTIVE";"false";"0"
"TECNO-SPARK-40C--8RAM-256GB";"";"SPARK 40C";"Celulares";"TECNO";"8+256GB";"0";"0";"7700";"";"";"ACTIVE";"true";"70"
"TECNO-SPARK-GO-2--3+64GB";"";"SPARK GO 2 ";"Celulares";"TECNO";"3+64GB";"0";"0";"4900";"";"";"ACTIVE";"true";"24"
"TECNO-SPARK-GO-2--4+128GB";"";"SPARK GO 2 ";"Celulares";"TECNO";"4+128GB";"0";"0";"5600";"";"";"ACTIVE";"true";"23"
"TELEVISION--SAMSUNG-TV-U7900FD-65""";"";" SAMSUNG TV U7900FD";"Celulares";"TELEVISION";"65""";"0";"0";"34000";"";"";"ACTIVE";"true";"10"
"TELEVISION-INSIGNIA-FIRETV-32""";"";"INSIGNIA FIRETV";"Celulares";"TELEVISION";"32""";"0";"0";"8600";"";"";"ACTIVE";"true";"5"
"TELEVISION-OTUXONE-ANDROID-TV-32""";"";"OTUXONE ANDROID TV";"Celulares";"TELEVISION";"32""";"0";"0";"8000";"";"";"ACTIVE";"true";"4"
"TELEVISION-SAMSUNG-SMART-TV--32""";"";"SAMSUNG SMART TV ";"Celulares";"TELEVISION";"32""";"0";"0";"9500";"";"";"ACTIVE";"true";"8"
"TELEVISION-TCL-ANDROID-TV-32""";"";"TCL ANDROID TV";"Celulares";"TELEVISION";"32""";"0";"0";"8900";"";"";"ACTIVE";"true";"3"
"TELEVISION-TCL-GOOGLE-TV-43""";"";"TCL GOOGLE TV";"Celulares";"TELEVISION";"43""";"0";"0";"15200";"";"";"ACTIVE";"false";"0"
"TELEVISION-TCL-GOOGLE-TV-QLED-55""";"";"TCL GOOGLE TV QLED";"Celulares";"TELEVISION";"55""";"0";"0";"25000";"";"";"ACTIVE";"true";"2"
"TELEVISION-TCL-ROKU-32";"";"TCL ROKU";"Celulares";"TELEVISION";"32";"0";"0";"8200";"";"";"ACTIVE";"true";"12"
"VORTEX-CG65--4RAM-64GB";"";"CG65 ";"Celulares";"VORTEX";"4RAM 64GB";"0";"0";"2500";"";"";"ACTIVE";"false";"0"
"VORTEX-CM62-3+32GB";"";"CM62";"Celulares";"VORTEX";"3+32GB";"0";"0";"2500";"";"";"ACTIVE";"true";"13"
"VORTEX-HD55-2+16GB";"";"HD55";"Celulares";"VORTEX";"2+16GB";"0";"0";"1600";"";"";"ACTIVE";"true";"17"
"VORTEX-HD55-PRO-2+16GB";"";"HD55 PRO";"Celulares";"VORTEX";"2+16GB";"0";"0";"1600";"";"";"ACTIVE";"true";"48"
"VORTEX-HD60L-3+32GB";"";"HD60L";"Celulares";"VORTEX";"3+32GB";"0";"0";"2500";"";"";"ACTIVE";"false";"0"
"VORTEX-HD62--3RAM-32GB";"";"HD62";"Celulares";"VORTEX";"3+32GB";"0";"0";"2500";"";"";"ACTIVE";"false";"64"
"VORTEX-HD65-PRO-2+16GB";"";"HD65 PRO";"Celulares";"VORTEX";"2+16GB";"0";"0";"1600";"";"";"ACTIVE";"false";"0"
"VORTEX-HD65-ULTRA-3+32GB";"";"HD65 ULTRA";"Celulares";"VORTEX";"3+32GB";"0";"0";"2500";"";"";"ACTIVE";"false";"62"
"VORTEX-ZG55-3+32GB";"";"ZG55";"Celulares";"VORTEX";"3+32GB";"0";"0";"2200";"";"";"ACTIVE";"true";"16"
"VORTEX-ZG65H-3+32GB-";"";"ZG65H";"Celulares";"VORTEX";"3+32GB ";"0";"0";"2250";"";"";"ACTIVE";"true";"15"
"XIAOMI-REDMI-A5-3+64GB";"";"REDMI A5";"Celulares";"XIAOMI";"3+64GB";"0";"0";"4900";"";"";"ACTIVE";"false";"0"
"ZTE-A35E-2+64GB";"";"A35E";"Celulares";"ZTE";"2+64GB";"0";"0";"4500";"";"";"ACTIVE";"true";"49"
"ZTE-A36-2+64GB";"";"A36";"Celulares";"ZTE";"2+64GB";"0";"0";"4700";"";"";"ACTIVE";"true";"42"
"ZTE-A56-4+128GB";"";"A56";"Celulares";"ZTE";"4+128GB";"0";"0";"5600";"";"";"ACTIVE";"true";"41"
"ZTE-A56-PRO-4+128GB";"";"A56 PRO";"Celulares";"ZTE";"4+128GB";"0";"0";"6500";"";"";"ACTIVE";"true";"40"
"ZTE-BLADE-A75-14+256GB";"";"BLADE A75";"Celulares";"ZTE";"14+256GB";"0";"0";"6600";"";"";"ACTIVE";"true";"39"
"cmsnrdk7r000004l2czb2ffoy";"";"V50 DESING";"Celulares";"ZTE";"6+256GB";"0";"0";"6200";"";"";"ACTIVE";"true";"52"
"ZTE-V70-DESING-8+256GB";"";"V70 DESING";"Celulares";"ZTE";"8+256GB";"0";"0";"6500";"";"";"ACTIVE";"true";"67"
`;

async function main() {
  console.log('--- Cargando datos exactos del usuario agrupados por marca ---');

  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.priceAuditLog.deleteMany();
  await prisma.productPrice.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.priceList.deleteMany();

  const listaGeneral = await prisma.priceList.create({
    data: {
      name: 'Lista de Precios Oficial',
      description: 'Tarifas oficiales en Pesos Dominicanos (RD$)',
      isDefault: true,
      currency: 'DOP',
    },
  });

  const adminPassword = await bcrypt.hash('admin123', 10);
  const mayoristaPassword = await bcrypt.hash('mayorista123', 10);

  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@senaldigital.com',
      passwordHash: adminPassword,
      name: 'Administrador General',
      role: 'ADMIN',
      companyName: 'Señal Digital Corp',
      phone: '+1 (809) 555-0100',
    },
  });

  const mayoristaUser = await prisma.user.create({
    data: {
      username: 'mayorista',
      email: 'cliente@mayorista.com',
      passwordHash: mayoristaPassword,
      name: 'Distribuidor Mayorista',
      role: 'WHOLESALER',
      companyName: 'Distribuciones Tech',
      phone: '+1 (809) 555-0220',
      priceListId: listaGeneral.id,
    },
  });

  // Colores modernos exactos por marca del usuario
  const brandColorPalette = {
    'SAMSUNG': '#00A3E0',
    'MOTOROLA': '#C026D3',
    'OUKITEL': '#0F766E',
    'VORTEX': '#BE123C',
    'BLU': '#1E293B',
    'ZTE': '#2563EB',
    'M-HORSE': '#4F46E5',
    'COOLPAD': '#7C3AED',
    'ITEL': '#E11D48',
    'TECNO': '#F59E0B',
    'TCL': '#0284C7',
    'TELEVISION': '#0369A1',
    'TABLETAS': '#0284C7',
    'TABLETA': '#0284C7',
    'BICICLETAS': '#0F172A',
    'SUNELAN': '#059669',
    'ALCATEL': '#475569',
    'KARGAMAX': '#D97706',
    'XIAOMI': '#F97316',
  };

  const categoryMap = new Map();
  const createdSkus = new Set();
  let count = 0;
  let activeCount = 0;

  const lines = rawCsvData.trim().split('\n');
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(';').map((c) => c.replace(/^"|"$/g, '').trim());
    if (cols.length < 9) continue;

    const idRaw = cols[0];
    const modelo = cols[2];
    let marcaRaw = (cols[4] || 'OTROS').toUpperCase().trim();
    if (marcaRaw === 'TABLETA') marcaRaw = 'TABLETAS';

    const capacidad = cols[5] || 'N/A';
    const precioDetallista = parseFloat(cols[8]) || parseFloat(cols[7]) || 0;
    const enListaActiva = cols[12] === 'true';
    const ordenLista = parseInt(cols[13]) || count;

    let cat = categoryMap.get(marcaRaw);
    if (!cat) {
      const headerColor = brandColorPalette[marcaRaw] || '#0071BC';
      cat = await prisma.category.create({
        data: {
          name: marcaRaw,
          slug: marcaRaw.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          headerColor,
          sortOrder: Object.keys(brandColorPalette).indexOf(marcaRaw) + 1 || 99,
        },
      });
      categoryMap.set(marcaRaw, cat);
    }

    let sku = idRaw || `${marcaRaw}-${modelo}-${capacidad}`.replace(/\s+/g, '-');
    if (createdSkus.has(sku)) {
      sku = `${sku}-${count}`;
    }
    createdSkus.add(sku);

    const product = await prisma.product.create({
      data: {
        brand: marcaRaw,
        model: modelo,
        capacity: capacidad,
        sku: sku,
        imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500',
        stock: 20,
        sortOrder: ordenLista,
        inActiveList: enListaActiva,
        isActive: true,
        categoryId: cat.id,
      },
    });

    await prisma.productPrice.create({
      data: {
        productId: product.id,
        priceListId: listaGeneral.id,
        currency: 'DOP',
        priceTier1: precioDetallista,
        priceTier2: precioDetallista,
        priceTier3: precioDetallista,
        isActive: true,
        createdById: adminUser.id,
      },
    });

    count++;
    if (enListaActiva) activeCount++;
  }

  console.log(`--- Se crearon ${count} productos del usuario (${activeCount} en lista activa) agrupados por marca ---`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
