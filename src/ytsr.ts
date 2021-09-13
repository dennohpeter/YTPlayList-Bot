import ytsr from "ytsr";

/**
 * Searches youtube for the given @param searchString based on on the preset filters
 * @param searchString User text to search on youtube

 * @param type Video type can be either playlist | video
 * @param feature video quality e.g 4K
 * @returns An array of search results found
 */

const youtubeSearch = async (
  searchString: string,
  type: string,
  feature?: string,
  duration?: string
) => {
  console.log(searchString, type, feature);

  const options = {
    pages: 5,
    limit: 4,
  };
  const filters = await ytsr.getFilters(searchString);
  let filter = filters.get("Type")?.get(type || "Video");
  if (type == "video") {
    if (feature) {
      const filters2 = await ytsr.getFilters(filter?.url || "");
      filter = filters2.get("Features")?.get(feature);
    }
    if (duration) {
      const filters3 = await ytsr.getFilters(filter?.url || "");
      filter = filters3.get("Duration")?.get(duration);
    }
  }
  if (!filter?.url) {
    return;
  }

  return await ytsr(filter.url, options);
};

export { youtubeSearch };
