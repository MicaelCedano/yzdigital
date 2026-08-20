const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Resembrando catálogo fiel 100% a Libatech ---');

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
      name: 'Lista de Precios Libatech',
      description: 'Precios mayoristas oficiales',
      isDefault: true,
      currency: 'DOP',
    },
  });

  const adminPassword = await bcrypt.hash('admin123', 10);
  const mayoristaPassword = await bcrypt.hash('mayorista123', 10);

  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@libatech.com',
      passwordHash: adminPassword,
      name: 'Administrador Libatech',
      role: 'ADMIN',
      companyName: 'Libatech Wholesale Corp',
      phone: '+1 (809) 555-0100',
    },
  });

  const mayoristaUser = await prisma.user.create({
    data: {
      username: 'mayorista',
      email: 'cliente@mayorista.com',
      passwordHash: mayoristaPassword,
      name: 'Cliente Distribuidor',
      role: 'WHOLESALER',
      companyName: 'Distribuciones Tech',
      phone: '+1 (809) 555-0220',
      priceListId: listaGeneral.id,
    },
  });

  const categoriesData = [
    // COLUMNA 1
    {
      name: 'MODELOS CALIENTE 🔥',
      slug: 'modelos-caliente',
      headerColor: '#000000',
      sortOrder: 1,
      products: [
        { model: 'VORTEX JK68 (4+32) NEW', price: 3176, isOffer: true, sku: 'VTX-JK68' },
        { model: 'CRICKET DREAM 5G (4+64) 6.82 PULG + 48MP Cámara', price: 4149, isOffer: false, sku: 'CRK-DRM5G' },
      ],
    },
    {
      name: 'MODELOS VARIADOS',
      slug: 'modelos-variados',
      headerColor: '#00509d',
      sortOrder: 2,
      products: [
        { model: 'MODEM CLOUD M2 CON PANTALLA + LLAMADAS', price: 1375, isOffer: true, sku: 'MDM-CLDM2' },
        { model: 'ORBIC MAUI 4G (3+32)', price: 2399, isOffer: false, sku: 'ORB-MAUI' },
        { model: 'ORBIC MYRA 5G (6+64)', price: 3799, isOffer: false, sku: 'ORB-MYRA' },
        { model: 'AMAZON FIRE STICK 4K', price: 2499, isOffer: false, hasPhoto: true, sku: 'AMZ-FS4K' },
      ],
    },
    {
      name: 'SAMSUNG',
      slug: 'samsung',
      headerColor: '#0071BC',
      sortOrder: 3,
      products: [
        { model: 'GALAXY F07 (64GB)', price: 6299, isOffer: false, sku: 'SAM-F07' },
        { model: 'GALAXY A06 (4+64)', price: 6199, isOffer: false, sku: 'SAM-A06' },
        { model: 'GALAXY A16 (4+128) 💥 MAXIMO 50 POR CLIENTE!', price: 7999, isOffer: true, sku: 'SAM-A16' },
        { model: 'GALAXY A17 (6+128)', price: 10099, isOffer: false, sku: 'SAM-A17-6' },
        { model: 'GALAXY A17 (4+128)', price: 9149, isOffer: false, sku: 'SAM-A17-4' },
        { model: 'GALAXY A17 8+256GB', price: 13975, isOffer: true, sku: 'SAM-A17-8' },
        { model: 'GALAXY A26 5G (6+128)', price: 12899, isOffer: false, sku: 'SAM-A26' },
        { model: 'GALAXY A27 5G (6+128)', price: 14399, isOffer: false, sku: 'SAM-A27-6' },
        { model: 'GALAXY A27 5G (8+256)', price: 18599, isOffer: false, sku: 'SAM-A27-8' },
        { model: 'GALAXY A36 5G (8+256)', price: 16995, isOffer: false, sku: 'SAM-A36' },
        { model: 'GALAXY A37 5G (8+256)', price: 20999, isOffer: false, sku: 'SAM-A37' },
        { model: 'GALAXY A57 5G (8+128)', price: 20685, isOffer: false, sku: 'SAM-A57' },
      ],
    },

    // COLUMNA 2
    {
      name: 'SEVEN HOTWAV',
      slug: 'seven-hotwav',
      headerColor: '#D32F2F',
      sortOrder: 4,
      products: [
        { model: 'SEVEN AIRPODS 1 NEW', price: 390, isOffer: false, sku: 'SVN-AIR1' },
        { model: 'A17 PRO MAX (12+128)+🎧', price: 0, statusText: 'En Camino', sku: 'SVN-A17PM' },
        { model: 'A26 ULTRA (12+64GB)+🎧', price: 5099, isOffer: false, sku: 'SVN-A26-64' },
        { model: 'A26 ULTRA (12+128)+🎧', price: 5495, isOffer: true, sku: 'SVN-A26-128' },
        { model: 'A26 ULTRA (12+256)+🎧', price: 6799, isOffer: false, sku: 'SVN-A26-256' },
        { model: 'NOTE 13 MAX (14+128)', price: 5349, isOffer: false, sku: 'SVN-N13M' },
        { model: 'NOTE 15 PRO (12+128)', price: 5349, isOffer: false, sku: 'SVN-N15P' },
        { model: 'NOTE 12 (16+128)', price: 5499, isOffer: false, sku: 'SVN-N12' },
      ],
    },
    {
      name: 'CUBOT',
      slug: 'cubot',
      headerColor: '#2E7D32',
      sortOrder: 5,
      products: [
        { model: 'RELOJ U1', price: 1199, hasPhoto: true, sku: 'CUB-U1' },
        { model: 'RELOJ C28', price: 1649, hasPhoto: true, sku: 'CUB-C28' },
        { model: 'RELOJ C29', price: 1599, hasPhoto: true, sku: 'CUB-C29' },
        { model: 'CUBOT GT3', price: 2650, hasPhoto: true, sku: 'CUB-GT3' },
        { model: 'A20 (12+128)+PANTALLA TRASERA', price: 6350, isOffer: false, sku: 'CUB-A20' },
        { model: 'A30 (16+128)+ PANTALLA TRASERA', price: 5799, isOffer: false, sku: 'CUB-A30' },
        { model: 'A40 (12+256)-TRIPLE CÁMARA', price: 6499, isOffer: false, sku: 'CUB-A40' },
        { model: 'P90 (24+256) DOBLE PANTALLA', price: 8499, isOffer: true, sku: 'CUB-P90' },
        { model: 'KING KONG ES (16+128)', price: 7499, isOffer: false, sku: 'CUB-KKES' },
        { model: 'KING KONG ACE 2 (16+128)', price: 7499, isOffer: false, sku: 'CUB-KKACE2' },
        { model: 'KING KONG ACE 5 (20+256)', price: 9799, isOffer: false, sku: 'CUB-KKACE5' },
        { model: 'KING KONG ES 3 (24+256)', price: 8999, isOffer: false, sku: 'CUB-KKES3' },
      ],
    },

    // COLUMNA 3
    {
      name: 'COOLPAD',
      slug: 'coolpad',
      headerColor: '#6A1B9A',
      sortOrder: 6,
      products: [
        { model: 'COOLPAD CP12 NEO (8+64)', price: 4475, isOffer: false, sku: 'CLP-CP12-64' },
        { model: 'COOLPAD CP12 NEO (6+128)', price: 4995, isOffer: false, sku: 'CLP-CP12-128' },
        { model: 'COOLPAD CP12 NEO PLUS (12+256)', price: 5699, isOffer: false, sku: 'CLP-CP12P-256' },
      ],
    },
    {
      name: 'MOTOROLA',
      slug: 'motorola',
      headerColor: '#8E24AA',
      sortOrder: 7,
      products: [
        { model: 'MOTO G06 (12+64)', price: 0, statusText: 'En Camino', sku: 'MOT-G06-64' },
        { model: 'MOTO G06 (12+128)', price: 6599, isOffer: false, sku: 'MOT-G06-128' },
        { model: 'MOTO G06 (12+256)', price: 7099, isOffer: false, sku: 'MOT-G06-256' },
        { model: 'MOTO G15 (14+256)', price: 7449, isOffer: false, sku: 'MOT-G15-256' },
        { model: 'EDGE 50 FUSION 5G (24+256)', price: 18495, isOffer: false, sku: 'MOT-E50F' },
        { model: 'EDGE 70 FUSION 8+8 (16+256)+REGALO', price: 22489, isOffer: false, sku: 'MOT-E70F' },
      ],
    },
    {
      name: 'TABLET 🖲️',
      slug: 'tablet',
      headerColor: '#0071BC',
      sortOrder: 8,
      products: [
        { model: 'QLINK 16GB (8")', price: 2295, hasPhoto: true, sku: 'TAB-QLINK8' },
        { model: 'SAMSUNG A7 LITE A+ SUELTA (3+32) +4G LTE', price: 4699, hasPhoto: true, sku: 'TAB-SAM-A7L' },
        { model: 'CUBOT TAB 65 (12+128) NEW TECLADO + MOUSE', price: 7499, hasPhoto: true, sku: 'TAB-CUB-T65' },
        { model: 'HONOR PAD X7 (4+128) + COVER TIPO LIBRO', price: 6849, hasPhoto: true, sku: 'TAB-HON-X7' },
        { model: 'DIALN S10 (4+64) 4G LTE', price: 4975, hasPhoto: true, isOffer: true, sku: 'TAB-DIA-S10' },
        { model: 'REDMI PAD 2 (4+128)', price: 8899, hasPhoto: true, sku: 'TAB-RED-P2' },
      ],
    },
    {
      name: 'BICICLETAS VIZZION',
      slug: 'bicicletas-vizzion',
      headerColor: '#0D233A',
      sortOrder: 9,
      products: [
        { model: 'BIKE F1 (400W)', price: 20500, isOffer: false, sku: 'BIKE-F1-400W' },
      ],
    },
  ];

  for (const catData of categoriesData) {
    const category = await prisma.category.create({
      data: {
        name: catData.name,
        slug: catData.slug,
        headerColor: catData.headerColor,
        sortOrder: catData.sortOrder,
      },
    });

    for (let i = 0; i < catData.products.length; i++) {
      const p = catData.products[i];
      const product = await prisma.product.create({
        data: {
          brand: catData.name,
          model: p.model,
          sku: p.sku,
          imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500',
          hasPhoto: p.hasPhoto || false,
          isOffer: p.isOffer || false,
          statusText: p.statusText || null,
          stock: 20,
          sortOrder: i,
          categoryId: category.id,
        },
      });

      await prisma.productPrice.create({
        data: {
          productId: product.id,
          priceListId: listaGeneral.id,
          currency: 'DOP',
          priceTier1: p.price,
          isActive: true,
          createdById: adminUser.id,
        },
      });
    }
  }

  console.log('--- Semillero Libatech cargado con éxito ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
