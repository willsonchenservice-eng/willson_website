import PhotoWallClient from "./PhotoWallClient";
import { getAllPhotos } from "@/lib/content";

export default async function PhotoWall() {
  const photos = await getAllPhotos();
  return <PhotoWallClient photos={photos} />;
}
