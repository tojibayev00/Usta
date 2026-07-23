/**
 * ============================================================
 * O'zbekiston Respublikasi ma'muriy hududiy bo'linishi
 * ------------------------------------------------------------
 * Bu ma'lumotlar bazada emas, statik JS obyekt sifatida
 * saqlanadi — chunki bu ma'lumot deyarli o'zgarmaydi va
 * har safar bazadan so'rash shart emas. Qishloq/mahalla
 * darajasi bu yerda yo'q (erkin matn sifatida kiritiladi),
 * faqat viloyat va tuman darajasi qat'iy ro'yxat.
 * ============================================================
 */

const UZBEKISTAN_REGIONS = [
  {
    name: 'Toshkent shahri',
    districts: [
      'Bektemir tumani', 'Chilonzor tumani', 'Mirobod tumani', "Mirzo Ulug'bek tumani",
      'Olmazor tumani', 'Sergeli tumani', 'Shayxontohur tumani', 'Uchtepa tumani',
      'Yakkasaroy tumani', 'Yashnobod tumani', 'Yunusobod tumani', 'Yangihayot tumani',
    ],
  },
  {
    name: 'Toshkent viloyati',
    districts: [
      'Bekobod tumani', "Bo'ka tumani", 'Chinoz tumani', 'Qibray tumani',
      'Ohangaron tumani', "Oqqo'rg'on tumani", 'Parkent tumani', 'Piskent tumani',
      'Quyi Chirchiq tumani', 'Yuqori Chirchiq tumani', "O'rta Chirchiq tumani",
      'Zangiota tumani', 'Toshkent tumani', "Yangiyo'l tumani", "Bo'stonliq tumani",
      'Nurafshon shahri',
    ],
  },
  {
    name: 'Andijon viloyati',
    districts: [
      'Andijon shahri', 'Andijon tumani', 'Asaka tumani', 'Baliqchi tumani',
      "Bo'z tumani", 'Buloqboshi tumani', 'Izboskan tumani', 'Jalaquduq tumani',
      "Xo'jaobod tumani", "Qo'rg'ontepa tumani", 'Marhamat tumani', "Oltinko'l tumani",
      'Paxtaobod tumani', 'Shahrixon tumani', "Ulug'nor tumani", 'Xonobod shahri',
      'Qorasuv shahri',
    ],
  },
  {
    name: "Farg'ona viloyati",
    districts: [
      "Farg'ona shahri", "Marg'ilon shahri", "Qo'qon shahri", "Farg'ona tumani",
      "Bag'dod tumani", 'Beshariq tumani', 'Buvayda tumani', "Dang'ara tumani",
      'Furqat tumani', "Qo'shtepa tumani", 'Oltiariq tumani', 'Rishton tumani',
      "So'x tumani", 'Toshloq tumani', "Uchko'prik tumani", "O'zbekiston tumani",
      'Yozyovon tumani', 'Quva tumani',
    ],
  },
  {
    name: 'Namangan viloyati',
    districts: [
      'Namangan shahri', 'Namangan tumani', 'Chortoq tumani', 'Chust tumani',
      'Kosonsoy tumani', 'Mingbuloq tumani', 'Norin tumani', 'Pop tumani',
      "To'raqo'rg'on tumani", 'Uychi tumani', "Uchqo'rg'on tumani", "Yangiqo'rg'on tumani",
      'Davlatobod tumani',
    ],
  },
  {
    name: 'Samarqand viloyati',
    districts: [
      'Samarqand shahri', "Kattaqo'rg'on shahri", 'Samarqand tumani', "Bulung'ur tumani",
      'Ishtixon tumani', 'Jomboy tumani', "Kattaqo'rg'on tumani", "Qo'shrabot tumani",
      'Narpay tumani', 'Nurobod tumani', 'Oqdaryo tumani', 'Payariq tumani',
      'Paxtachi tumani', 'Pastdarg\'om tumani', 'Toyloq tumani', 'Urgut tumani',
    ],
  },
  {
    name: 'Buxoro viloyati',
    districts: [
      'Buxoro shahri', 'Kogon shahri', 'Buxoro tumani', "G'ijduvon tumani",
      'Jondor tumani', 'Kogon tumani', 'Olot tumani', 'Peshku tumani',
      "Qorako'l tumani", 'Qorovulbozor tumani', 'Romitan tumani', 'Shofirkon tumani',
      'Vobkent tumani',
    ],
  },
  {
    name: 'Xorazm viloyati',
    districts: [
      'Urganch shahri', 'Urganch tumani', "Bog'ot tumani", 'Gurlan tumani',
      'Xazorasp tumani', 'Xonqa tumani', "Qo'shko'pir tumani", 'Shovot tumani',
      'Xiva tumani', 'Yangiariq tumani', 'Yangibozor tumani', "Tuproqqal'a tumani",
    ],
  },
  {
    name: 'Qashqadaryo viloyati',
    districts: [
      'Qarshi shahri', 'Qarshi tumani', 'Chiroqchi tumani', 'Dehqonobod tumani',
      "G'uzor tumani", 'Kasbi tumani', 'Kitob tumani', 'Koson tumani',
      'Mirishkor tumani', 'Muborak tumani', 'Nishon tumani', 'Qamashi tumani',
      'Shahrisabz tumani', "Yakkabog' tumani", "Ko'kdala tumani",
    ],
  },
  {
    name: 'Surxondaryo viloyati',
    districts: [
      'Termiz shahri', 'Termiz tumani', 'Angor tumani', 'Bandixon tumani',
      'Boysun tumani', 'Denov tumani', "Jarqo'rg'on tumani", 'Muzrabot tumani',
      'Oltinsoy tumani', 'Qiziriq tumani', "Qumqo'rg'on tumani", 'Sariosiyo tumani',
      'Sherobod tumani', "Sho'rchi tumani", 'Uzun tumani',
    ],
  },
  {
    name: 'Jizzax viloyati',
    districts: [
      'Jizzax shahri', 'Jizzax tumani', 'Arnasoy tumani', 'Baxmal tumani',
      "Do'stlik tumani", 'Forish tumani', "G'allaorol tumani", "Mirzacho'l tumani",
      'Paxtakor tumani', 'Zarbdor tumani', 'Zafarobod tumani', 'Zomin tumani',
    ],
  },
  {
    name: 'Sirdaryo viloyati',
    districts: [
      'Guliston shahri', 'Guliston tumani', 'Boyovut tumani', 'Mirzaobod tumani',
      'Oqoltin tumani', 'Sardoba tumani', 'Sayxunobod tumani', 'Sirdaryo tumani',
      'Xovos tumani', "Yangiyer shahri",
    ],
  },
  {
    name: 'Navoiy viloyati',
    districts: [
      'Navoiy shahri', 'Navbahor tumani', 'Konimex tumani', 'Karmana tumani',
      'Qiziltepa tumani', 'Xatirchi tumani', 'Nurota tumani', 'Tomdi tumani',
      "Uchquduq tumani", 'Zarafshon shahri',
    ],
  },
  {
    name: "Qoraqalpog'iston Respublikasi",
    districts: [
      'Nukus shahri', 'Amudaryo tumani', 'Beruniy tumani', 'Chimboy tumani',
      "Ellikqal'a tumani", 'Kegeyli tumani', "Mo'ynoq tumani", 'Nukus tumani',
      "Qanliko'l tumani", "Qorao'zak tumani", "Qo'ng'irot tumani", 'Shumanay tumani',
      "Taxtako'pir tumani", "To'rtko'l tumani", "Xo'jayli tumani",
    ],
  },
];

module.exports = { UZBEKISTAN_REGIONS };
