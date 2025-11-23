export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabsParamList = {
  Home: undefined;
  Auctions: undefined;
  Bids: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  AuctionDetail: { id: number };
};

