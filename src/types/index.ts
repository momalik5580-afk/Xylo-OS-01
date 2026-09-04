export type NavigationModule =
  | "command-center"
  | "digital-twin"
  | "front-office"
  | "reservations"
  | "group-blocks"
  | "allotments"
  | "housekeeping"
  | "engineering"
  | "inventory"
  | "fnb"
  | "finance"
  | "crm"
  | "workflows";

export type PropertyId = "dubai-grand-marina" | "st-moritz-alpine" | "singapore-urban" | "maldives-coral-reef";

export interface Property {
  id: PropertyId;
  name: string;
  location: string;
  type: "Resort & Spa" | "Alpine Luxury" | "Urban Business" | "Mega Complex";
  totalRooms: number;
  currency: string;
  timezone: string;
  weather: {
    temp: number;
    condition: string;
  };
}

export type UserRole =
  | "GENERAL_MANAGER"
  | "FRONT_DESK_LEAD"
  | "HOUSEKEEPING_EXEC"
  | "CHIEF_ENGINEER"
  | "REVENUE_STRATEGIST"
  | "FNB_DIRECTOR"
  | "General Manager"
  | "Front Office Lead"
  | "Executive Housekeeper"
  | "Chief Engineer"
  | "Revenue Director"
  | "Finance Controller";

export type RoomStatus =
  | "OCCUPIED"
  | "VACANT_CLEAN"
  | "VACANT_DIRTY"
  | "INSPECTED"
  | "OUT_OF_ORDER"
  | "DAY_USE";

export type RoomCategory =
  | "Deluxe King"
  | "Executive Ocean Suite"
  | "Panoramic Sky Suite"
  | "Presidential Penthouse"
  | "Overwater Coral Villa";

export type VipTier = "None" | "Silver" | "Gold" | "Diamond" | "Royal VIP";

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  category: RoomCategory;
  status: RoomStatus;
  rate: number;
  guestName?: string;
  reservationId?: string;
  checkInDate?: string;
  checkOutDate?: string;
  vipTier?: VipTier;
  iot: {
    temperature: number;
    targetTemp: number;
    humidity: number;
    lockStatus: "LOCKED" | "UNLOCKED" | "BATTERY_LOW";
    powerKw: number;
    motionDetected: boolean;
    dnd: boolean;
    makeupRoom: boolean;
  };
  housekeepingAttendant?: string;
  lastCleaned?: string;
}

export type RatePlan = "Best Available Rate" | "Corporate Luxury" | "Direct VIP Member" | "All-Inclusive Package" | "Wholesale Series Contract";
export type BookingChannel = "Direct Web" | "Booking.com" | "Expedia" | "GDS Corporate" | "Airbnb Luxe" | "Wholesaler / Tour Operator";
export type GuaranteeType = "CC_GUARANTEE" | "DEPOSIT_PAID" | "COMPANY_DIRECT_BILL" | "6PM_HOLD";
export type RoutingInstructionType = "MASTER_ROOM_AND_TAX" | "ALL_TO_MASTER" | "INDIVIDUAL_OWN_ACCOUNT";

export interface OperaTrace {
  id: string;
  department: "FRONT_DESK" | "HOUSEKEEPING" | "CONCIERGE" | "ENGINEERING" | "REVENUE" | "FINANCE";
  date: string;
  note: string;
  resolved: boolean;
}

export interface Reservation {
  id: string;
  confirmationNo: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomCategory: RoomCategory;
  roomNumber?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  status: "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "NO_SHOW";
  ratePlan: RatePlan;
  ratePerNight: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  channel: BookingChannel;
  vipTier: VipTier;
  specialRequests?: string[];
  digitalKeyActive: boolean;
  regCardSigned: boolean;
  loyaltyNumber?: string;
  groupBlockCode?: string;
  companyName?: string;
  travelAgent?: string;
  iataNumber?: string;
  guaranteeType?: GuaranteeType;
  routingInstruction?: RoutingInstructionType;
  traces?: OperaTrace[];
  marketCode?: string;
  sourceCode?: string;
}

export type HousekeepingPriority = "HIGH" | "MEDIUM" | "LOW" | "URGENT_CHECKIN" | "VIP" | "URGENT" | "NORMAL";

export interface HousekeepingTask {
  id: string;
  roomNumber: string;
  floor?: number;
  type: string;
  priority: HousekeepingPriority;
  status: "PENDING" | "IN_PROGRESS" | "INSPECTED" | "COMPLETED";
  attendant?: string;
  assignedAttendant?: string;
  estimatedMinutes: number;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  linenChanged?: boolean;
  createdAt?: string;
}

export interface WorkOrder {
  id: string;
  asset: string;
  location: string;
  category: "HVAC" | "Plumbing" | "Smart Lock" | "Electrical" | "AudioVisual" | "Elevator" | string;
  priority: "EMERGENCY" | "HIGH" | "MEDIUM" | "ROUTINE";
  status: "OPEN" | "DISPATCHED" | "IN_PROGRESS" | "RESOLVED";
  reportedBy: string;
  assignedEngineer: string;
  reportedAt: string;
  slaMinutes: number;
  description: string;
  iotTriggered: boolean;
  partsUsed?: string[];
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  location?: string;
  warehouse?: string;
  onHand?: number;
  stockLevel?: number;
  reserved?: number;
  parLevel?: number;
  minParLevel?: number;
  unit: string;
  unitCost: number;
  reorderPoint?: number;
  supplier?: string;
  leadTimeDays?: number;
  status?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  department: string;
  createdAt?: string;
  orderDate?: string;
  deliveryDate?: string;
  expectedDelivery?: string;
  totalCost?: number;
  totalAmount?: number;
  status: string;
  itemsCount?: number;
  items?: {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  threeWayMatched: boolean;
}

export interface FnbTicket {
  id: string;
  ticketNumber: string;
  outlet: string;
  tableOrRoom: string;
  server: string;
  timestamp: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    specialNotes?: string;
    status?: string;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
}

export interface GuestProfile {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  phone: string;
  country?: string;
  vipTier: VipTier;
  staysCount?: number;
  stayHistoryCount?: number;
  lifetimeSpend: number;
  loyaltyPoints?: number;
  preferredRoomCategory?: RoomCategory;
  preferences?: Record<string, any>;
  lastStayDate?: string;
  sentimentScore?: number;
  activeReservation?: string;
}

export interface TemporalWorkflowInstance {
  id: string;
  name: string;
  workflowType: string;
  status: string;
  progressPercent: number;
  currentStep: string;
  startedAt: string;
  slaMinutes: number;
  steps: {
    id: string;
    name: string;
    actor: string;
    status: string;
    durationMs: number;
  }[];
  logs: string[];
}

export interface AiAutonomousAction {
  id: string;
  timestamp: string;
  actionType: "RATE_YIELD_CHANGE" | "VIP_UPGRADE" | "DISPATCH_TURNOVER" | "IOT_LOCK_RESET" | "ENERGY_CURTAILMENT";
  department: string;
  title: string;
  reasoning: string;
  metricsImpact: string;
  status: "EXECUTED" | "PENDING_APPROVAL" | "SUPERSEDED";
}

export interface GroupBlockRoomTypeAllocation {
  roomCategory: RoomCategory;
  allocated: number;
  pickedUp: number;
  rate: number;
}

export interface GroupBlockDailyGrid {
  date: string;
  dayName: string;
  allocations: GroupBlockRoomTypeAllocation[];
}

export type BillingRoutingInstruction = "MASTER_FOLIO" | "INDIVIDUAL_FOLIO" | "SPLIT_BILLING";

export interface GroupDelegate {
  id: string;
  reservationId: string;
  confirmationNo: string;
  guestName: string;
  email: string;
  vipTier: VipTier;
  roomCategory: RoomCategory;
  roomNumber?: string;
  checkIn: string;
  checkOut: string;
  billingRouting: BillingRoutingInstruction;
  folioBalance: number;
  status: "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";
}

export interface BanquetFunctionSpace {
  id: string;
  name: string;
  date: string;
  timeSlot: string;
  setupStyle: "THEATER" | "CLASSROOM" | "BANQUET_ROUNDS" | "U_SHAPE" | "BOARDROOM";
  attendees: number;
  rentalFee: number;
  cateringPlan: string;
  status: "CONFIRMED" | "HELD";
}

export type MasterTransactionCategory =
  | "DEPOSIT"
  | "ROOM_AND_TAX"
  | "BANQUET_CATERING"
  | "MEETING_ROOM_RENTAL"
  | "AV_EQUIPMENT"
  | "ATTRITION_FEE"
  | "PAYMENT_CREDIT"
  | "ADJUSTMENT";

export interface GroupMasterTransaction {
  id: string;
  date: string;
  category: MasterTransactionCategory;
  description: string;
  referenceNo?: string;
  amount: number; // positive = charge to group, negative = payment/credit
  postedBy: string;
}

export interface GroupBlock {
  id: string;
  groupName: string;
  blockCode: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone?: string;
  companyAccount?: string;
  marketSegment?: "MICE" | "CORP_GROUP" | "ASSOCIATION" | "SMERF" | "WEDDING";
  startDate: string;
  endDate: string;
  roomCategory: RoomCategory;
  negotiatedRate: number;
  allocatedRooms: number;
  pickedUpRooms: number;
  cutOffDate: string;
  status: "DEFINITE" | "TENTATIVE" | "CLOSED" | "CANCELLED";
  billingMethod: "MASTER_FOLIO" | "INDIVIDUAL_FOLIO" | "SPLIT_BILLING";
  depositPaid: number;
  notes?: string;
  masterFolioNo?: string;
  masterCreditLimit?: number;
  masterBalance?: number;
  attritionThresholdPercent?: number;
  inventoryStatus?: "DEDUCT" | "NON_DEDUCT";
  rateCode?: string;
  shoulderDaysBefore?: number;
  shoulderDaysAfter?: number;
  roomGrid?: GroupBlockDailyGrid[];
  delegates?: GroupDelegate[];
  functionSpaces?: BanquetFunctionSpace[];
  masterTransactions?: GroupMasterTransaction[];
  washHistory?: { date: string; roomsReleased: number; reason: string }[];
}

export interface ResortActivity {
  id: string;
  title: string;
  category: "WELLNESS_SPA" | "EXCURSION" | "WATER_SPORTS" | "DINING_EXPERIENCE" | "VIP_TRANSFER";
  durationMinutes: number;
  pricePerPerson: number;
  maxCapacity: number;
  location: string;
  dailySchedule: string[];
  description: string;
  activeCountToday?: number;
}

export interface ResortEventBooking {
  id: string;
  guestOrGroupName: string;
  activityTitle: string;
  category: "WELLNESS_SPA" | "EXCURSION" | "WATER_SPORTS" | "DINING_EXPERIENCE" | "VIP_TRANSFER" | "BANQUET";
  date: string;
  timeSlot: string;
  participants: number;
  totalPrice: number;
  roomNumber?: string;
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED";
  specialRequirements?: string;
}

// ==========================================
// ALLOTMENT & TOUR OPERATOR / WHOLESALER TYPES
// ==========================================

export type AllotmentType = "ROLLING_RELEASE" | "GUARANTEED_BLOCK" | "FREE_SALE";

export type AllotmentPartnerType =
  | "TOUR_OPERATOR"
  | "WHOLESALER_BEDBANK"
  | "AIRLINE_CREW"
  | "TRAVEL_AGENCY_SERIES"
  | "CORPORATE_FIT";

export type MealPlan = "RO" | "BB" | "HB" | "FB" | "AI"; // Room Only, Bed & Breakfast, Half Board, Full Board, All-Inclusive

export interface AllotmentRoomAllocation {
  roomCategory: RoomCategory;
  dailyQuota: number;
  contractedNetRate: number;
  retailBarRate: number;
  currency: string;
}

export interface AllotmentDailyQuota {
  date: string; // YYYY-MM-DD
  dayName: string;
  roomCategory: RoomCategory;
  allocatedQuota: number;
  pickedUp: number; // vouchers booked
  remaining: number;
  isStopSale: boolean;
  stopSaleReason?: string;
  releaseCountdownDays: number;
  isReleasedToHouse: boolean;
}

export interface AllotmentVoucherBooking {
  id: string;
  voucherNumber: string; // e.g. "VCH-TUI-884920"
  reservationId: string;
  confirmationNo: string;
  guestName: string;
  passengerEmail?: string;
  passengerPhone?: string;
  roomCategory: RoomCategory;
  roomNumber?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  paxAdults: number;
  paxChildren: number;
  mealPlan: MealPlan;
  contractedNetRate: number;
  totalNetCharge: number;
  retailBarEquivalent: number;
  status: "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "NO_SHOW";
  bookingDate: string;
  specialRequests?: string;
}

export interface AllotmentStopSale {
  id: string;
  startDate: string;
  endDate: string;
  roomCategory: RoomCategory | "ALL";
  reason: string;
  appliedDate: string;
  appliedBy: string;
}

export interface AllotmentReleaseLog {
  id: string;
  date: string;
  roomsReleased: number;
  roomCategory: RoomCategory | "ALL";
  targetArrivalDate: string;
  reason: string;
  triggeredBy: string;
  timestamp: string;
}

export interface AllotmentContract {
  id: string;
  contractCode: string; // e.g. "ALLOT-TUI-S26"
  partnerName: string; // e.g. "TUI Nordic Holidays"
  partnerType: AllotmentPartnerType;
  contactPerson: string;
  contactEmail: string;
  contactPhone?: string;
  validFrom: string; // e.g. "2026-05-01"
  validTo: string; // e.g. "2026-10-31"
  allotmentType: AllotmentType;
  releaseDays: number; // e.g. 14 days rolling release
  status: "ACTIVE" | "ON_HOLD" | "EXPIRED" | "TERMINATED";
  defaultMealPlan: MealPlan;
  paymentTerms: string;
  notes?: string;
  roomAllocations: AllotmentRoomAllocation[];
  stopSales: AllotmentStopSale[];
  vouchers: AllotmentVoucherBooking[];
  releaseLogs: AllotmentReleaseLog[];
}
