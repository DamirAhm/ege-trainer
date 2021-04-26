export type subject = {
  title: string;
  subsubjects: {
    title: string;
    prefix: string;
  }[];
};

export type topic = {
  issue: string;
  title: string;
  url?: string;
  subtopics?: {
    title: string;
    url: string;
    id: number;
    amount: number;
  };
};

export type task = {
  task: string;
  text?: string;
  solution: string;
  answer: string | string[];
  answerType: "text" | "html";
  id: string;
};

export type savedContent = {
  subjects: subject[];
  topics: {
    [key: string]: topic[];
  };
  tasks: {
    [subj: string]: {
      [issue: string]: {
        [theme: string]: task[];
      };
    };
  };
};
