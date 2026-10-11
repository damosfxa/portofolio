export type Project = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[] | null;
  thumbnail: string | null;
  link: string | null;
  github: string | null;
  sort: number | null;
};

export type Skill = {
  id: number;
  name: string;
  category: string | null;
  sort: number | null;
};

export type Certificate = {
  id: number;
  title: string;
  image: string | null;
  sort: number | null;
};

export type TimelineItem = {
  id: number;
  year: string | null;
  title: string;
  description: string | null;
  sort: number | null;
};
