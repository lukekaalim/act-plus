import { Tag } from "@lukekaalim/act-doc/lib";
import { createTagStore } from "@lukekaalim/act-doc/stores";

export const tags = createTagStore();

tags.add(
  Tag('meta'),
  Tag('package', { color: '#F16F2F' }),
  Tag('dev', { display: 'development' }),
  Tag('blog'),
  Tag('api'),
)
