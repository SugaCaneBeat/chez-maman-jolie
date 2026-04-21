import Image from "next/image";
import AddToCartButton from "./AddToCartButton";

interface BoissonItem {
  id?: string;
  name: string;
  price: number;
  image?: string;
}

interface BoissonCategory {
  name: string;
  image?: string;
  items: BoissonItem[];
}

interface BoissonsData {
  categories: BoissonCategory[];
}

export default function BoissonsSection({ data }: { data: BoissonsData }) {
  const formatPrice = (price: number) => {
    return price % 1 === 0 ? `${price} €` : `${price.toFixed(2).replace('.', ',')} €`;
  };

  return (
    <div className="mb-8">
      <h3 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-8">
        Boissons
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.categories.map((cat) => (
          <div key={cat.name} className="glass rounded-[5px] overflow-hidden hover:bg-white/10 transition-all duration-500 hover:scale-[1.02]">
            {cat.image && (
              <div className="relative h-36 img-zoom">
                <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-transparent" />
                <h4 className="absolute bottom-3 left-5 font-heading text-white text-lg font-bold">{cat.name}</h4>
              </div>
            )}
            {!cat.image && (
              <div className="px-5 pt-5">
                <h4 className="font-heading text-white text-lg font-bold">{cat.name}</h4>
              </div>
            )}
            <div className="p-5 space-y-2.5">
              {cat.items.map((item, i) => (
                <div key={item.id ?? `${cat.name}-${i}`} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-white/70 flex-1 min-w-0 truncate">{item.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-bold text-primary whitespace-nowrap">{formatPrice(item.price)}</span>
                    <AddToCartButton
                      item={{
                        id: item.id ?? `boisson-${cat.name}-${item.name}`,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                      }}
                      className="!w-7 !h-7"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
