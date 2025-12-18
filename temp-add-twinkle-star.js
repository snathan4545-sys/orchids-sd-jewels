const productData = {
  name: "Twinkle Star Necklace",
  description: "Exquisite twinkle star necklace set with antique gold finish and matching earrings. Features intricate linked loop design adorned with sparkling star-motif drops for an elegant traditional look.",
  price: 699,
  originalPrice: 859,
  category: "necklaces",
  images: [
    "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-16-at-23.44.28_2c2b8ccb-1765912291348.jpg?width=8000&height=8000&resize=contain",
    "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-16-at-23.44.29_ae178ed9-1765912291353.jpg?width=8000&height=8000&resize=contain"
  ],
  colors: ["Gold"],
  inStock: true,
  featured: true
};

fetch('http://localhost:3000/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(productData)
})
.then(res => { console.log('status', res.status); return res.json(); })
.then(data => console.log(JSON.stringify(data)))
.catch(err => console.error(err));
