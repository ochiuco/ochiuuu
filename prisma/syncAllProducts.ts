// prisma/syncAllProducts.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// OC00014 ~ OC00023 的数据（图片路径已修正为磁盘实际文件）
const products14to23 = [
  {
    productNo: "OC00014",
    name: "蕾絲後背上衣",
    category: "tops",
    hemService: false,
    tag: null,
    material: null,
    price: 16000,
    originalPrice: null,
    sizeInfo: null,
    description: `一字肩蕾絲拼接露背短袖上衣\n純黑柔軟彈力面料，貼膚透氣，夏日穿著舒適無負擔。\n正面為氣質盪領一字肩剪裁，輕鬆露出肩頸線條；\n衣身側邊收褶設計，自然收腰顯瘦，勾勒柔和曲線。\n後背滿幅透感蕾絲拼接，搭配同色系綁帶可自由調節鬆緊，\n若隱若現透膚細節增添些少性感，前後對比充滿設計感。\n短款合身版型，搭配高腰牛仔短褲、闊腿休閒褲、緞面半裙都很契合`,
    colors: [{ name: "黑色", value: "#000000" }],
    colorImages: {
      "黑色": [
        "/images/products/OC00014/OC00014.JPG",
        "/images/products/OC00014/OC00014_1.JPG",
        "/images/products/OC00014/OC00014_2.JPG",
        "/images/products/OC00014/OC00014_3.JPG",
        "/images/products/OC00014/OC00014_4.JPG",
      ],
    },
    sizes: ["均碼"],
    stock: { "黑色-均碼": 4 },
    images: [
      "/images/products/OC00014/OC00014.JPG",
      "/images/products/OC00014/OC00014_1.JPG",
      "/images/products/OC00014/OC00014_2.JPG",
      "/images/products/OC00014/OC00014_3.JPG",
      "/images/products/OC00014/OC00014_4.JPG",
    ],
    hoverImage: "/images/products/OC00014/OC00014_1.JPG",
    care: ["手洗", "不可漂白", "陰涼處晾乾"],
    details: ["蕾絲拼接設計", "後背綁帶可調節", "短款合身版型"],
  },
  {
    productNo: "OC00015",
    name: "硬身牛仔褲（深綠色）",
    category: "bottoms",
    hemService: true,
    tag: null,
    material: null,
    price: 19900,
    originalPrice: null,
    sizeInfo: "S碼：褲長103，腰圍76，臀圍91，腳口53，大腿圍55",
    description: `輕薄透氣面料，垂順不悶，日常行走舒展自在。\n中腰微闊版型，順直修飾腿型，鬆度剛好、松弛不垮，\n低調卡其色百搭耐看。\n搭配短上衣、T恤、針織衫都合適，散步、日常通勤穿，休閒隨性，\n打造輕鬆日常風。\nO'CHIU有話說：版型包容各類腿型，輕鬆穿出松弛氣質。`,
    colors: [{ name: "墨綠色", value: "#023020" }],
    colorImages: {
      "墨綠色": [
        "/images/products/OC00015/OC00015.JPG",
      ],
    },
    sizes: ["S", "M"],
    stock: { "墨綠色-S": 5, "墨綠色-M": 5 },
    images: ["/images/products/OC00015/OC00015.JPG"],
    hoverImage: "/images/products/OC00015/OC00015.JPG",
    care: ["機洗", "不可漂白", "低溫烘乾"],
    details: ["硬身牛仔面料", "中腰設計", "提供剪褲腳服務"],
  },
  {
    productNo: "OC00016",
    name: "首期強推！休閒瑜伽褲",
    category: "bottoms",
    hemService: true,
    tag: null,
    material: "莫代爾混紡面料",
    price: 19000,
    originalPrice: null,
    sizeInfo: null,
    description: `柔軟莫代爾混紡面料，垂順親膚、彈力舒適，日常、運動健身穿都柔軟無束縛，透氣排汗不易悶。\n寬邊高腰設計搭配可調抽繩腰頭，貼合腰腹不易滑落，能收束腰線、視覺拉長身形；直筒闊管剪裁順直垂墜，包容胯寬、大腿贅肉，修飾腿型顯得筆直修長。\n側邊實用小口袋，細節實用美觀，日常隨身收納小物件；整體版型鬆而不垮，搭配短款運動上衣、修身T恤、休閒衛衣都很協調，健身、逛街、居家一褲多用，日常松弛百搭。\n\nO'CHIU有話說：垂感好不易皺，面料柔軟貼膚不勒身，高矮身形都能穿出順直大長腿效果，通勤休閒兩相宜。`,
    colors: [
      { name: "黑色", value: "#000000" },
      { name: "藏青色", value: "#003300" },
      { name: "白色", value: "#FFFFFF" },
    ],
    colorImages: {
      "黑色": [
        "/images/products/OC00016/OC00016_B.JPG",
        "/images/products/OC00016/OC00016_B_1.JPG",
      ],
      "藏青色": [
        "/images/products/OC00016/OC00016_Blue_1.JPG",
      ],
      "白色": [
        "/images/products/OC00016/OC00016_W_1.JPG",
      ],
    },
    sizes: ["S", "M"],
    stock: {
      "黑色-S": 20, "黑色-M": 20,
      "藏青色-S": 20, "藏青色-M": 20,
      "白色-S": 20, "白色-M": 20,
    },
    images: [
      "/images/products/OC00016/OC00016_B.JPG",
      "/images/products/OC00016/OC00016_B_1.JPG",
      "/images/products/OC00016/OC00016_Blue_1.JPG",
      "/images/products/OC00016/OC00016_W_1.JPG",
    ],
    hoverImage: "/images/products/OC00016/OC00016_B_1.JPG",
    care: ["手洗或輕柔機洗", "不可漂白", "平攤晾乾"],
    details: ["莫代爾混紡面料", "高腰抽繩設計", "直筒闊管剪裁", "側邊口袋"],
  },
  {
    productNo: "OC00017",
    name: "背後鏤空綁帶吊帶（黑色）",
    category: "tops",
    hemService: false,
    tag: null,
    material: "棉",
    price: 5900,
    originalPrice: null,
    sizeInfo: null,
    description: `高彈坑條柔軟面料，貼身舒適、透氣親膚。\n圓領無袖設計，日常利落顯肩頸線條；\n後背大鏤空搭配可調綁帶，隨意調節鬆緊，\n修身短露腰版型，拉高腰線、打造黃金比例。\n疊搭外套合適，休閒出街、探店打卡都適合，簡約又帶點小辣的日常基礎款。`,
    colors: [{ name: "黑色", value: "#000000" }],
    colorImages: {
      "黑色": [
        "/images/products/OC00017/OC00017.JPG",
        "/images/products/OC00017/OC00017_1.JPG",
        "/images/products/OC00017/OC00017_2.JPG",
      ],
    },
    sizes: ["均碼"],
    stock: { "黑色-均碼": 5 },
    images: [
      "/images/products/OC00017/OC00017.JPG",
      "/images/products/OC00017/OC00017_1.JPG",
      "/images/products/OC00017/OC00017_2.JPG",
    ],
    hoverImage: "/images/products/OC00017/OC00017_1.JPG",
    care: ["手洗", "不可漂白", "陰涼處晾乾"],
    details: ["高彈坑條面料", "後背鏤空綁帶", "修身短款"],
  },
  {
    productNo: "OC00018",
    name: "假兩件V領五分袖修身上衣",
    category: "tops",
    hemService: false,
    tag: "BESTSELLER",
    material: "灰調柔軟坑條面料",
    price: 21000,
    originalPrice: null,
    sizeInfo: null,
    description: `撞色假兩件設計，白色翻領拼接V領內層，層次感滿滿，營造襯衫疊穿效果；五分袖翻折白袖口，細節乾淨利落，溫柔遮蓋手臂贅肉。\n側邊微收褶修身剪裁，緊實勾勒腰腹曲線，短款版型搭配高腰下裝輕鬆拉長比例。\n搭配白色闊褲、牛仔長褲、緞面半裙都百搭，通勤、日常休閒都合適，簡約知性風格不挑人。\n\nO'CHIU有話說：高彈面料包容身形，不易變形起球，假兩件款式省去搭配煩惱，一件就能穿出精致感。`,
    colors: [
      { name: "黑色", value: "#000000" },
      { name: "灰色", value: "#808080" },
    ],
    colorImages: null,
    sizes: ["S", "M"],
    stock: { "黑色-S": 2, "灰色-S": 2, "灰色-M": 1 },
    images: ["/images/products/OC00018/OC00018.JPG"],
    hoverImage: "/images/products/OC00018/OC00018.JPG",
    care: ["手洗", "不可漂白", "平攤晾乾"],
    details: ["假兩件撞色設計", "五分袖遮蓋手臂", "修身收褶剪裁"],
  },
  {
    productNo: "OC00019",
    name: "裙子式闊腿褲",
    category: "bottoms",
    hemService: false,
    tag: "BESTSELLER",
    material: null,
    price: 23900,
    originalPrice: null,
    sizeInfo: "S碼：褲長90，腰圍68，臀圍84，腳口46，大腿圍95\nM碼：褲長95，腰圍73，臀圍84，腳口48，大腿圍95",
    description: `面料輕薄透氣，夏天長時間外出都唔會覺得焗熱。\n獨特斜幅腰頭設計，營造出假兩件層次感，釦點細節增添設計感；\n褲身寬鬆花苞剪裁，空間充足，大腿、胯部贅肉完全收埋，唔會貼身顯臃腫。\n下擺可收束成花苞造型，亦能自然放開做闊腳褲，\n一條褲兩種穿法；搭配波點背心、簡約短上衣都充滿隨性休閒感，\n日常出街舒適又有記憶點。\n\nO'CHIU有話說：軟滑輕薄面料易打理，闊鬆版型唔揀身形，高矮著都能穿出鬆弛感。`,
    colors: [
      { name: "黑色", value: "#000000" },
      { name: "灰色", value: "#808080" },
    ],
    colorImages: null,
    sizes: ["S", "M"],
    stock: {
      "黑色-S": 20, "黑色-M": 20,
      "灰色-S": 20, "灰色-M": 20,
    },
    images: [
      "/images/products/OC00019/OC00019.JPG",
      "/images/products/OC00019/OC00019_1.JPG",
      "/images/products/OC00019/OC00019_2.JPG",
      "/images/products/OC00019/OC00019_3.JPG",
    ],
    hoverImage: "/images/products/OC00019/OC00019_1.JPG",
    care: ["手洗", "不可漂白", "懸掛晾乾"],
    details: ["斜幅腰頭假兩件設計", "花苞/闊腳兩種穿法", "輕薄透氣面料"],
  },
  {
    productNo: "OC00020",
    name: "純色收腰五分袖白襯衫",
    category: "tops",
    hemService: false,
    tag: null,
    material: null,
    price: 16900,
    originalPrice: null,
    sizeInfo: null,
    description: `乾淨純白色調，面料輕薄透氣\n帶自然微皺肌理，穿著充滿隨性鬆弛感。\n經典翻領款式溫和不挑人，胸前兩個貼袋增添細節層次；\n五分袖可隨意捲起，袖口綁帶設計方便調節長短\n衣身兩側做隱藏收褶，自然收束腰線，不會顯得臃腫。\n搭配緞面長半裙、闊腿西褲都十分協調，日常出行、簡約通勤都合適。\n\nO'CHIU有話說：面料柔軟不硬挺，不用刻意熨燙也有休閒氛圍，日常打理簡單省心。`,
    colors: [
      { name: "白色", value: "#FFFFFF" },
      { name: "黑色", value: "#000000" },
    ],
    colorImages: {
      "白色": [
        "/images/products/OC00020/OC00020_W.JPG",
        "/images/products/OC00020/OC00020_W_1.JPG",
        "/images/products/OC00020/OC00020_W_2.JPG",
        "/images/products/OC00020/OC00020_W_3.JPG",
      ],
      "黑色": [
        "/images/products/OC00020/OC00020_B.JPG",
        "/images/products/OC00020/OC00020_B_1.JPG",
      ],
    },
    sizes: ["均碼"],
    stock: { "白色-均碼": 4, "黑色-均碼": 4 },
    images: [
      "/images/products/OC00020/OC00020_W.JPG",
      "/images/products/OC00020/OC00020_W_1.JPG",
      "/images/products/OC00020/OC00020_W_2.JPG",
      "/images/products/OC00020/OC00020_W_3.JPG",
      "/images/products/OC00020/OC00020_B.JPG",
      "/images/products/OC00020/OC00020_B_1.JPG",
    ],
    hoverImage: "/images/products/OC00020/OC00020_W_1.JPG",
    care: ["手洗", "不可漂白", "低溫熨燙"],
    details: ["翻領設計", "五分袖綁帶可調", "收褶收腰", "胸前貼袋"],
  },
  {
    productNo: "OC00021",
    name: "蕾絲短袖襯衫",
    category: "tops",
    hemService: false,
    tag: null,
    material: null,
    price: 16900,
    originalPrice: null,
    sizeInfo: null,
    description: `乾淨色調百搭耐看，面料輕薄順滑\n春夏穿著透氣舒適，不會貼身焗熱。\n經典翻領設計溫柔大方，內層搭配蕾絲V領拼接，層次感豐富；\n泡泡短袖柔和遮蓋手臂贅肉，版型不臃腫。\n門襟單排扣開合，衣側隱藏收褶搭配後腰可調節繫帶，\n自由收束腰線，輕鬆勾勒腰腹曲線，顯瘦又拉高比例。\n搭配緞面半身長裙、闊腿西褲、牛仔短褲都合襯，通勤、約會、日常出行都適合`,
    colors: [
      { name: "白色", value: "#FFFFFF" },
      { name: "卡其", value: "#FFFFCC" },
    ],
    colorImages: null,
    sizes: ["均碼"],
    stock: { "白色-均碼": 20, "卡其-均碼": 20 },
    images: [
      "/images/products/OC00021/OC00021.JPG",
      "/images/products/OC00021/OC00021_1.JPG",
      "/images/products/OC00021/OC00021_2.JPG",
    ],
    hoverImage: "/images/products/OC00021/OC00021_1.JPG",
    care: ["手洗", "不可漂白", "陰涼處晾乾"],
    details: ["蕾絲V領拼接", "泡泡短袖", "後腰可調繫帶", "單排扣門襟"],
  },
  {
    productNo: "OC00022",
    name: "蕾絲V領帶胸墊吊帶背心",
    category: "tops",
    hemService: false,
    tag: null,
    material: "純棉",
    price: 6900,
    originalPrice: null,
    sizeInfo: null,
    description: `純白坑條柔軟面料，貼膚透氣，夏天單穿、內搭都舒適。\nV領邊緣拼接雙層花邊蕾絲，中間搭配小巧蝴蝶結點綴，溫柔甜妹感滿滿；細肩帶可自由調節長短，贴合肩線不滑落。\n一體式固定胸墊設計，不用額外搭配內衣，日常穿著省心；修身短款剪裁，輕輕收束腰腹，搭配高腰下裝超顯比例。\n無論單穿出街、搭配襯衫、針織開衫都合適，日常通勤、休閒約會百搭不出錯。\n\nO'CHIU有話說：彈力坑條面料包容身形，胸墊柔軟不跑墊，蕾絲做工精緻不易勾絲。`,
    colors: [
      { name: "黑色", value: "#000000" },
      { name: "白色", value: "#FFFFFF" },
      { name: "藍色", value: "#0000FF" },
    ],
    colorImages: {
      "黑色": [
        "/images/products/OC00022/OC00022_B_1.JPG",
      ],
      "白色": [
        "/images/products/OC00022/OC00022_W.JPG",
        "/images/products/OC00022/OC00022_W_1.JPG",
      ],
      "藍色": [
        "/images/products/OC00022/OC00022_Blue_1.JPG",
        "/images/products/OC00022/OC00022_Blue_2.JPG",
      ],
    },
    sizes: ["均碼"],
    stock: { "黑色-均碼": 20, "白色-均碼": 20, "藍色-均碼": 20 },
    images: [
      "/images/products/OC00022/OC00022_B_1.JPG",
      "/images/products/OC00022/OC00022_W.JPG",
      "/images/products/OC00022/OC00022_W_1.JPG",
      "/images/products/OC00022/OC00022_Blue_1.JPG",
      "/images/products/OC00022/OC00022_Blue_2.JPG",
    ],
    hoverImage: "/images/products/OC00022/OC00022_W.JPG",
    care: ["手洗", "不可漂白", "取出胸墊再洗", "平攤晾乾"],
    details: ["蕾絲V領花邊", "一體式固定胸墊", "可調節肩帶", "純棉坑條面料"],
  },
  {
    productNo: "OC00023",
    name: "基礎修身短款純色T恤",
    category: "tops",
    hemService: false,
    tag: null,
    material: "純棉",
    price: 5500,
    originalPrice: null,
    sizeInfo: null,
    description: `柔軟高彈磨毛面料，貼膚順滑，日常穿清爽透氣，四季百搭內外皆宜。\n圓領經典版型，合身微收剪裁，側身微收皺細節，勾勒腰腹線條，短款露腰設計，輕鬆拉高腰線，搭配高腰下裝超顯比例。\n緊實包肩短袖，線條利落，日常單穿、疊搭都好駕馭，深棕復古耐看，純黑酷感利落，米白乾淨清新，三色隨意切換穿搭風格。\n配牛仔短褲、闊腿褲、工裝褲都百搭，日常街頭、休閒出行、運動休閒都適合，基礎實用款衣櫃必備。\n\nO'CHIU有話說：彈力耐穿不易變形，面料親膚不悶，三色入手換穿無壓力，簡單就能穿出利落辣妹日常感。`,
    colors: [
      { name: "咖啡色", value: "#996600" },
      { name: "黑色", value: "#000000" },
      { name: "白色", value: "#FFFFFF" },
    ],
    colorImages: null,
    sizes: ["均碼"],
    stock: { "咖啡色-均碼": 20, "黑色-均碼": 20, "白色-均碼": 20 },
    images: ["/images/products/OC00023/placeholder.JPG"],
    hoverImage: null,
    care: ["機洗", "不可漂白", "低溫烘乾"],
    details: ["高彈磨毛面料", "修身短款剪裁", "圓領包肩短袖", "純棉親膚"],
  },
];

// OC00001~OC00013 的 productNo 映射
const productNoMap: Record<string, string> = {
  "首期強推！復古玫瑰提花彎刀褲": "OC00001",
  "美式破洞水洗七分褲（預售）": "OC00002",
  "花花蕾絲短袖": "OC00003",
  "米白短款皮衣外套": "OC00004",
  "韓系波點花苞蓬蓬半身裙": "OC00005",
  "淺灰貓紋牛仔短褲": "OC00006",
  "短款麻質連衣裙（預售）": "OC00007",
  "波點半袖娃娃袖襯衣（預售）": "OC00008",
  "高腰闊腿西褲": "OC00009",
  "薄身西裝褲": "OC00010",
  "絲綢半身長裙": "OC00011",
  "緞面側邊蕾絲裙": "OC00012",
  "斜肩帶扣上衣": "OC00013",
};

const hemServiceMap: Record<string, boolean> = {
  "OC00001": true,
  "OC00002": true,
  "OC00003": false,
  "OC00004": false,
  "OC00005": true,
  "OC00006": false,
  "OC00007": false,
  "OC00008": true,
  "OC00009": true,
  "OC00010": true,
  "OC00011": true,
  "OC00012": true,
  "OC00013": false,
};

async function main() {
  console.log("🚀 開始安全同步全部 23 個商品（upsert，不刪除任何數據）...\n");

  // ===== 處理 OC00001 ~ OC00013（從 realProducts.json 讀取） =====
  const jsonPath = path.join(__dirname, "realProducts.json");
  const rawData = fs.readFileSync(jsonPath, "utf-8");
  const products1to13 = JSON.parse(rawData);

  let count = 0;

  for (const product of products1to13) {
    const productNo = productNoMap[product.name];
    if (!productNo) {
      console.log(`  ⚠️ 找不到 productNo 映射: ${product.name}`);
      continue;
    }

    const data = {
      name: product.name,
      description: product.description || "",
      price: product.price,
      originalPrice: product.originalPrice || null,
      category: product.category,
      tag: product.tag || null,
      tags: product.tag ? [product.tag] : [],
      material: product.material || null,
      hemService: hemServiceMap[productNo] ?? false,
      images: product.images || [],
      hoverImage: product.hoverImage || null,
      colors: product.colors || [],
      colorImages: product.colorImages || null,
      sizes: product.sizes || [],
      stock: product.stock || {},
      care: product.care || [],
      details: product.details || [],
      isActive: true,
    };

    await prisma.product.upsert({
      where: { productNo },
      update: data,
      create: { ...data, productNo, soldCount: 0 },
    });
    console.log(`  ✅ ${productNo} - ${product.name}`);
    count++;
  }

  // ===== 處理 OC00014 ~ OC00023 =====
  for (const product of products14to23) {
    const data = {
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      tag: product.tag,
      tags: product.tag ? [product.tag] : [],
      material: product.material,
      hemService: product.hemService,
      sizeInfo: product.sizeInfo,
      images: product.images,
      hoverImage: product.hoverImage,
      colors: product.colors,
      colorImages: product.colorImages,
      sizes: product.sizes,
      stock: product.stock,
      care: product.care,
      details: product.details,
      isActive: true,
    };

    await prisma.product.upsert({
      where: { productNo: product.productNo },
      update: data as any ,
      create: { ...data, productNo: product.productNo, soldCount: 0 } as any,
    });
    console.log(`  ✅ ${product.productNo} - ${product.name}`);
    count++;
  }

  console.log(`\n🎉 完成！共同步 ${count} 個商品，訂單/用戶/積分數據完全不受影響`);
}

main()
  .catch((e) => {
    console.error("❌ 同步失敗：", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());