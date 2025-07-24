export type Invoice = {
  emailId: string;
  rideSharingService: 'Pathao' | 'Uber';
  fare: number;
  startTime: Date;
  startAddress: string;
  endTime: Date;
  endAddress: string;
};
