import Image from "next/image";

interface MenuItem {
  name: string;
  price: number;
  accompagnement?: string;
  badge?: string;
  image?: string;
}

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
  showAccompagnement?: boolean;
}

export default function MenuSection({ title, items, showAccompagnement = false }: MenuSectionProps) {
  const formatPrice = (price: number) => {
    return price % 1 === 0 ? `${price} €` : `${price.toFixed(2).replace('.', ',')} €`;
  };

  return (
    <div className="mb-8">
      <h3 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-8">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <div
            key={item.name}
            className="group glass rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/5"
          >
            {item.image && (
              <div className="relative h-44 img-zoom">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-transparent" />
                {item.badge && (
                  <span className="absolute top-3 left-3 inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-accent/90 text-white uppercase tracking-wider backdrop-blur-sm">
                    {item.badge}
                  </span>
                )}
                <span className="absolute bottom-3 right-3 bg-primary/90 backdrop-blur-sm text-dark font-bold px-3 py-1 rounded-xl text-sm">
                  {formatPrice(item.price)}
                </span>
              </div>
            )}
            <div className="p-5">
              <h4 className="font-semibold text-white group-hover:text-primary transition-colors text-base">
                {item.name}
              </h4>
              {showAccompagnement && item.accompagnement && (
                <p className="text-sm text-white/40 mt-1">{item.accompagnement}</p>
              )}
              {!item.image && (
                <span className="text-primary font-bold text-lg">{formatPrice(item.price)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
