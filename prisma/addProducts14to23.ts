import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const newProducts = [
  // ============ OC00014 ============
  {
    productNo: "OC00014",
    name: "蕾絲後背上衣",
    category: "tops",
    hemService: false,
    tag: null,
    material: null,
    price: 160,
    originalPrice: null,
    sizeInfo: null,
    description: `一字肩蕾絲拼接露背短袖上衣
純黑柔軟彈力面料，貼膚透氣，夏日穿著舒適無負擔。
正面為氣質盪領一字肩剪裁，輕鬆露出肩頸線條；
衣身側邊收褶設計，自然收腰顯瘦，勾勒柔和曲線。
後背滿幅透感蕾絲拼接，搭配同色系綁帶可自由調節鬆緊，
若隱若現透膚細節增添些少性感，前後對比充滿設計感。
短款合身版型，搭配高腰牛仔短褲、闊腿休閒褲、緞面半裙都很契合`,
    colors: [{ name: "黑色", value: "#000000" }],
    colorImages: {
      "黑色": [
        "/images/products/OC00014/OC00014_B_1.JPG",
        "/images/products/OC00014/OC00014_B_2.JPG",
      ],
    },
    sizes: ["均碼"],
    stock: { "黑色-均碼": 4 },
    images: ["/images/products/OC00014/OC00014_B_1.JPG"],
    hoverImage: "/images/products/OC00014/OC00014_B_2.JPG",
    care: ["手洗", "不可漂白", "陰涼處晾乾"],
    details: ["蕾絲拼接設計", "後背綁帶可調節", "短款合身版型"],
  },

  // ============ OC00015 ============
  {
    productNo: "OC00015",
    name: "硬身牛仔褲（深綠色）",
    category: "bottoms",
    hemService: true,
    tag: null,
    material: null,
    price: 199,
    originalPrice: null,
    sizeInfo: "S碼：褲長103，腰圍76，臀圍91，腳口53，大腿圍55",
    description: `輕薄透氣面料，垂順不悶，日常行走舒展自在。
中腰微闊版型，順直修飾腿型，鬆度剛好、松弛不垮，
低調卡其色百搭耐看。
搭配短上衣、T恤、針織衫都合適，散步、日常通勤穿，休閒隨性，
打造輕鬆日常風。
O'CHIU有話說：版型包容各類腿型，輕鬆穿出松弛氣質。`,
    colors: [{ name: "墨綠色", value: "#023020" }],
    colorImages: {
      "墨綠色": [
        "/images/products/OC00015/OC00015_G_1.JPG",
        "/images/products/OC00015/OC00015_G_2.JPG",
      ],
    },
    sizes: ["S", "M"],
    stock: { "墨綠色-S": 5, "墨綠色-M": 5 },
    images: ["/images/products/OC00015/OC00015_G_1.JPG"],
    hoverImage: "/images/products/OC00015/OC00015_G_2.JPG",
    care: ["機洗", "不可漂白", "低溫烘乾"],
    details: ["硬身牛仔面料", "中腰設計", "提供剪褲腳服務"],
  },

  // ============ OC00016 ============
  {
    productNo: "OC00016",
    name: "首期強推！休閒瑜伽褲",
    category: "bottoms",
    hemService: true,
    tag: null,
    material: "莫代爾混紡面料",
    price: 190,
    originalPrice: null,
    sizeInfo: null,
    description: `柔軟莫代爾混紡面料，垂順親膚、彈力舒適，日常、運動健身穿都柔軟無束縛，透氣排汗不易悶。
寬邊高腰設計搭配可調抽繩腰頭，貼合腰腹不易滑落，能收束腰線、視覺拉長身形；直筒闊管剪裁順直垂墜，包容胯寬、大腿贅肉，修飾腿型顯得筆直修長。
側邊實用小口袋，細節實用美觀，日常隨身收納小物件；整體版型鬆而不垮，搭配短款運動上衣、修身T恤、休閒衛衣都很協調，健身、逛街、居家一褲多用，日常松弛百搭。

O'CHIU有話說：垂感好不易皺，面料柔軟貼膚不勒身，高矮身形都能穿出順直大長腿效果，通勤休閒兩相宜。`,
    colors: [
      { name: "黑色", value: "#000000" },
      { name: "藏青色", value: "#003300" },
      { name: "白色", value: "#FFFFFF" },
    ],
    colorImages: {
      "黑色": [
        "/images/products/OC00016/OC00016_B_1.JPG",
        "/images/products/OC00016/OC00016_B_2.JPG",
      ],
      "藏青色": [
        "/images/products/OC00016/OC00016_N_1.JPG",
        "/images/products/OC00016/OC00016_N_2.JPG",
      ],
      "白色": [
        "/images/products/OC00016/OC00016_W_1.JPG",
        "/images/products/OC00016/OC00016_W_2.JPG",
      ],
    },
    sizes: ["S", "M"],
    stock: {
      "黑色-S": 20, "黑色-M": 20,
      "藏青色-S": 20, "藏青色-M": 20,
      "白色-S": 20, "白色-M": 20,
    },
    images: ["/images/products/OC00016/OC00016_B_1.JPG"],
    hoverImage: "/images/products/OC00016/OC00016_B_2.JPG",
    care: ["手洗或輕柔機洗", "不可漂白", "平攤晾乾"],
    details: ["莫代爾混紡面料", "高腰抽繩設計", "直筒闊管剪裁", "側邊口袋"],
  },

  // ============ OC00017 ============
  {
    productNo: "OC00017",
    name: "背後鏤空綁帶吊帶（黑色）",
    category: "tops",
    hemService: false,
    tag: null,
    material: "棉",
    price: 59,
    originalPrice: null,
    sizeInfo: null,
    description: `高彈坑條柔軟面料，貼身舒適、透氣親膚。
圓領無袖設計，日常利落顯肩頸線條；
後背大鏤空搭配可調綁帶，隨意調節鬆緊，
修身短露腰版型，拉高腰線、打造黃金比例。
疊搭外套合適，休閒出街、探店打卡都適合，簡約又帶點小辣的日常基礎款。`,
    colors: [{ name: "黑色", value: "#000000" }],
    colorImages: {
      "黑色": [
        "/images/products/OC00017/OC00017_B_1.JPG",
        "/images/products/OC00017/OC00017_B_2.JPG",
      ],
    },
    sizes: ["均碼"],
    stock: { "黑色-均碼": 5 },
    images: ["/images/products/OC00017/OC00017_B_1.JPG"],
    hoverImage: "/images/products/OC00017/OC00017_B_2.JPG",
    care: ["手洗", "不可漂白", "陰涼處晾乾"],
    details: ["高彈坑條面料", "後背鏤空綁帶", "修身短款"],
  },

  // ============ OC00018 ============
  {
    productNo: "OC00018",
    name: "假兩件V領五分袖修身上衣",
    category: "tops",
    hemService: false,
    tag: "BESTSELLER",
    material: "灰調柔軟坑條面料",
    price: 210,
    originalPrice: null,
    sizeInfo: null,
    description: `撞色假兩件設計，白色翻領拼接V領內層，層次感滿滿，營造襯衫疊穿效果；五分袖翻折白袖口，細節乾淨利落，溫柔遮蓋手臂贅肉。
側邊微收褶修身剪裁，緊實勾勒腰腹曲線，短款版型搭配高腰下裝輕鬆拉長比例。
搭配白色闊褲、牛仔長褲、緞面半裙都百搭，通勤、日常休閒都合適，簡約知性風格不挑人。

O'CHIU有話說：高彈面料包容身形，不易變形起球，假兩件款式省去搭配煩惱，一件就能穿出精致感。`,
    colors: [
      { name: "黑色", value: "#000000" },
      { name: "灰色", value: "#808080" },
    ],
    colorImages: {
      "黑色": [
        "/images/products/OC00018/OC00018_B_1.JPG",
        "/images/products/OC00018/OC00018_B_2.JPG",
      ],
      "灰色": [
        "/images/products/OC00018/OC00018_Gr_1.JPG",
        "/images/products/OC00018/OC00018_Gr_2.JPG",
      ],
    },
    sizes: ["S", "M"],
    // 表格明確寫了 "B-S:2,G-S:2,G-M:1"
    stock: { "黑色-S": 2, "灰色-S": 2, "灰色-M": 1 },
    images: ["/images/products/OC00018/OC00018_B_1.JPG"],
    hoverImage: "/images/products/OC00018/OC00018_B_2.JPG",
    care: ["手洗", "不可漂白", "平攤晾乾"],
    details: ["假兩件撞色設計", "五分袖遮蓋手臂", "修身收褶剪裁"],
  },

  // ============ OC00019 ============
  {
    productNo: "OC00019",
    name: "裙子式闊腿褲",
    category: "bottoms",
    hemService: false,
    tag: "BESTSELLER",
    material: null,
    price: 239,
    originalPrice: null,
    sizeInfo: "S碼：褲長90，腰圍68，臀圍84，腳口46，大腿圍95\nM碼：褲長95，腰圍73，臀圍84，腳口48，大腿圍95",
    description: `面料輕薄透氣，夏天長時間外出都唔會覺得焗熱。
獨特斜幅腰頭設計，營造出假兩件層次感，釦點細節增添設計感；
褲身寬鬆花苞剪裁，空間充足，大腿、胯部贅肉完全收埋，唔會貼身顯臃腫。
下擺可收束成花苞造型，亦能自然放開做闊腳褲，
一條褲兩種穿法；搭配波點背心、簡約短上衣都充滿隨性休閒感，
日常出街舒適又有記憶點。

O'CHIU有話說：軟滑輕薄面料易打理，闊鬆版型唔揀身形，高矮著都能穿出鬆弛感。`,
    colors: [
      { name: "黑色", value: "#000000" },
      { name: "灰色", value: "#808080" },
    ],
    colorImages: {
      "黑色": [
        "/images/products/OC00019/OC00019_B_1.JPG",
        "/images/products/OC00019/OC00019_B_2.JPG",
      ],
      "灰色": [
        "/images/products/OC00019/OC00019_Gr_1.JPG",
        "/images/products/OC00019/OC00019_Gr_2.JPG",
      ],
    },
    sizes: ["S", "M"],
    stock: {
      "黑色-S": 20, "黑色-M": 20,
      "灰色-S": 20, "灰色-M": 20,
    },
    images: ["/images/products/OC00019/OC00019_B_1.JPG"],
    hoverImage: "/images/products/OC00019/OC00019_B_2.JPG",
    care: ["手洗", "不可漂白", "懸掛晾乾"],
    details: ["斜幅腰頭假兩件設計", "花苞/闊腳兩種穿法", "輕薄透氣面料"],
  },

  // ============ OC00020 ============
  {
    productNo: "OC00020",
    name: "純色收腰五分袖白襯衫",
    category: "tops",
    hemService: false,
    tag: null,
    material: null,
    price: 169,
    originalPrice: null,
    sizeInfo: null,
    description: `乾淨純白色調，面料輕薄透氣
帶自然微皺肌理，穿著充滿隨性鬆弛感。
經典翻領款式溫和不挑人，胸前兩個貼袋增添細節層次；
五分袖可隨意捲起，袖口綁帶設計方便調節長短
衣身兩側做隱藏收褶，自然收束腰線，不會顯得臃腫。
搭配緞面長半裙、闊腿西褲都十分協調，日常出行、簡約通勤都合適。

O'CHIU有話說：面料柔軟不硬挺，不用刻意熨燙也有休閒氛圍，日常打理簡單省心。`,
    colors: [
      { name: "白色", value: "#FFFFFF" },
      { name: "黑色", value: "#000000" },
    ],
    colorImages: {
      "白色": [
        "/images/products/OC00020/OC00020_W_1.JPG",
        "/images/products/OC00020/OC00020_W_2.JPG",
      ],
      "黑色": [
        "/images/products/OC00020/OC00020_B_1.JPG",
        "/images/products/OC00020/OC00020_B_2.JPG",
      ],
    },
    sizes: ["均碼"],
    stock: { "白色-均碼": 4, "黑色-均碼": 4 },
    images: ["/images/products/OC00020/OC00020_W_1.JPG"],
    hoverImage: "/images/products/OC00020/OC00020_W_2.JPG",
    care: ["手洗", "不可漂白", "低溫熨燙"],
    details: ["翻領設計", "五分袖綁帶可調", "收褶收腰", "胸前貼袋"],
  },

  // ============ OC00021 ============
  {
    productNo: "OC00021",
    name: "蕾絲短袖襯衫",
    category: "tops",
    hemService: false,
    tag: null,
    material: null,
    price: 169,
    originalPrice: null,
    sizeInfo: null,
    description: `乾淨色調百搭耐看，面料輕薄順滑
春夏穿著透氣舒適，不會貼身焗熱。
經典翻領設計溫柔大方，內層搭配蕾絲V領拼接，層次感豐富；
泡泡短袖柔和遮蓋手臂贅肉，版型不臃腫。
門襟單排扣開合，衣側隱藏收褶搭配後腰可調節繫帶，
自由收束腰線，輕鬆勾勒腰腹曲線，顯瘦又拉高比例。
搭配緞面半身長裙、闊腿西褲、牛仔短褲都合襯，通勤、約會、日常出行都適合`,
    colors: [
      { name: "白色", value: "#FFFFFF" },
      { name: "卡其", value: "#FFFFCC" },
    ],
    colorImages: {
      "白色": [
        "/images/products/OC00021/OC00021_W_1.JPG",
        "/images/products/OC00021/OC00021_W_2.JPG",
      ],
      "卡其": [
        "/images/products/OC00021/OC00021_K_1.JPG",
        "/images/products/OC00021/OC00021_K_2.JPG",
      ],
    },
    sizes: ["均碼"],
    stock: { "白色-均碼": 20, "卡其-均碼": 20 },
    images: ["/images/products/OC00021/OC00021_W_1.JPG"],
    hoverImage: "/images/products/OC00021/OC00021_W_2.JPG",
    care: ["手洗", "不可漂白", "陰涼處晾乾"],
    details: ["蕾絲V領拼接", "泡泡短袖", "後腰可調繫帶", "單排扣門襟"],
  },

  // ============ OC00022 ============
  {
    productNo: "OC00022",
    name: "蕾絲V領帶胸墊吊帶背心",
    category: "tops",
    hemService: false,
    tag: null,
    material: "純棉",
    price: 69,
    originalPrice: null,
    sizeInfo: null,
    description: `純白坑條柔軟面料，貼膚透氣，夏天單穿、內搭都舒適。
V領邊緣拼接雙層花邊蕾絲，中間搭配小巧蝴蝶結點綴，溫柔甜妹感滿滿；細肩帶可自由調節長短，贴合肩線不滑落。
一體式固定胸墊設計，不用額外搭配內衣，日常穿著省心；修身短款剪裁，輕輕收束腰腹，搭配高腰下裝超顯比例。
無論單穿出街、搭配襯衫、針織開衫都合適，日常通勤、休閒約會百搭不出錯。

O'CHIU有話說：彈力坑條面料包容身形，胸墊柔軟不跑墊，蕾絲做工精緻不易勾絲。`,
    colors: [
      { name: "黑色", value: "#000000" },
      { name: "灰色", value: "#808080" },
      { name: "藍色", value: "#0000FF" },
    ],
    colorImages: {
      "黑色": [
        "/images/products/OC00022/OC00022_B_1.JPG",
        "/images/products/OC00022/OC00022_B_2.JPG",
      ],
      "灰色": [
        "/images/products/OC00022/OC00022_Gr_1.JPG",
        "/images/products/OC00022/OC00022_Gr_2.JPG",
      ],
      "藍色": [
        "/images/products/OC00022/OC00022_Bl_1.JPG",
        "/images/products/OC00022/OC00022_Bl_2.JPG",
      ],
    },
    sizes: ["均碼"],
    stock: { "黑色-均碼": 20, "灰色-均碼": 20, "藍色-均碼": 20 },
    images: ["/images/products/OC00022/OC00022_B_1.JPG"],
    hoverImage: "/images/products/OC00022/OC00022_B_2.JPG",
    care: ["手洗", "不可漂白", "取出胸墊再洗", "平攤晾乾"],
    details: ["蕾絲V領花邊", "一體式固定胸墊", "可調節肩帶", "純棉坑條面料"],
  },

  // ============ OC00023 ============
  {
    productNo: "OC00023",
    name: "基礎修身短款純色T恤",
    category: "tops",
    hemService: false,
    tag: null,
    material: "純棉",
    price: 55,
    originalPrice: null,
    sizeInfo: null,
    description: `柔軟高彈磨毛面料，貼膚順滑，日常穿清爽透氣，四季百搭內外皆宜。
圓領經典版型，合身微收剪裁，側身微收皺細節，勾勒腰腹線條，短款露腰設計，輕鬆拉高腰線，搭配高腰下裝超顯比例。
緊實包肩短袖，線條利落，日常單穿、疊搭都好駕馭，深棕復古耐看，純黑酷感利落，米白乾淨清新，三色隨意切換穿搭風格。
配牛仔短褲、闊腿褲、工裝褲都百搭，日常街頭、休閒出行、運動休閒都適合，基礎實用款衣櫃必備。

O'CHIU有話說：彈力耐穿不易變形，面料親膚不悶，三色入手換穿無壓力，簡單就能穿出利落辣妹日常感。`,
    colors: [
      { name: "咖啡色", value: "#996600" },
      { name: "黑色", value: "#000000" },
      { name: "白色", value: "#FFFFFF" },
    ],
    colorImages: {
      "咖啡色": [
        "/images/products/OC00023/OC00023_Br_1.JPG",
        "/images/products/OC00023/OC00023_Br_2.JPG",
      ],
      "黑色": [
        "/images/products/OC00023/OC00023_B_1.JPG",
        "/images/products/OC00023/OC00023_B_2.JPG",
      ],
      "白色": [
        "/images/products/OC00023/OC00023_W_1.JPG",
        "/images/products/OC00023/OC00023_W_2.JPG",
      ],
    },
    sizes: ["均碼"],
    stock: { "咖啡色-均碼": 20, "黑色-均碼": 20, "白色-均碼": 20 },
    images: ["/images/products/OC00023/OC00023_Br_1.JPG"],
    hoverImage: "/images/products/OC00023/OC00023_Br_2.JPG",
    care: ["機洗", "不可漂白", "低溫烘乾"],
    details: ["高彈磨毛面料", "修身短款剪裁", "圓領包肩短袖", "純棉親膚"],
  },
];

async function main() {
  console.log("🚀 開始添加 OC00014 ~ OC00023...\n");

  let count = 0;
  for (const product of newProducts) {
    const existing = await prisma.product.findFirst({
      where: { productNo: product.productNo },
    });

    if (existing) {
      console.log(`  ⏭️  ${product.productNo} 已存在，跳過`);
      continue;
    }

    const created = await prisma.product.create({
      data: {
        productNo: product.productNo,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        category: product.category,
        tag: product.tag,
        tags: product.tag ? [product.tag] : [],
        material: product.material,
        sizeInfo: product.sizeInfo,
        hemService: product.hemService,
        images: product.images,
        hoverImage: product.hoverImage,
        colors: product.colors,
        colorImages: product.colorImages,
        sizes: product.sizes,
        stock: product.stock,
        care: product.care,
        details: product.details,
        soldCount: 0,
        isActive: true,
      },
    });
    console.log(`  ✅ ${product.productNo} - ${created.name}`);
    count++;
  }

  console.log(`\n🎉 完成！新增了 ${count} 個商品`);
}

main()
  .catch((e) => { console.error("❌", e); process.exit(1); })
  .finally(() => prisma.$disconnect());