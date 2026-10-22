import catalogData from '@/data/catalog/catalog.json';
import { PokemonCard } from '@/types/card';
import { Dashboard } from '@/components/Dashboard';

export default function Page() {
  const catalog = (catalogData || []) as unknown as PokemonCard[];

  return <Dashboard initialCatalog={catalog} />;
}
