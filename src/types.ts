export type ConsecutiveAward = {
  producer: string;
  interval: number;
  previousWin: number;
  followingWin: number;
};

export type ConsecutiveAwardGaps = {
  max: ConsecutiveAward[];
  min: ConsecutiveAward[];
};
