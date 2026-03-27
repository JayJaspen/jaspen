import AlbumDetailPage from '@/components/AlbumDetailPage'

export default async function AllmantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <AlbumDetailPage
      albumId={id}
      basePath="/dashboard/allmant"
      backLabel="Allmänt"
    />
  )
}
