import { notFound } from 'next/navigation';
import { Descent } from '../../page';
import { LAYERS } from '@/content/layers';
import { ROUTES } from '@/content/routes';

export function generateStaticParams() {
  return LAYERS.filter((l) => l.id !== 'bedrock').map((l) => ({ slug: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const route = ROUTES.find((r) => r.path === `/layer/${slug}`);
  if (!route) return {};
  return { title: route.title, description: route.description };
}

export default async function LayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!LAYERS.some((l) => l.id === slug && l.id !== 'bedrock')) notFound();
  return <Descent />;
}
