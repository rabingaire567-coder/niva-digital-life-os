import type { Category, Jurisdiction } from '@/types';

/**
 * Reference checklists per life-admin task.
 *
 * These are generic, publicly-documented procedural steps — not an official
 * source. Every plan generated from this base is labelled "offline" and carries
 * a reminder to confirm requirements with the issuing authority, because fees,
 * forms and office locations change.
 */
export interface KnowledgeEntry {
  kind: string;
  label: string;
  category: Category;
  /** Default warning window in days. */
  lead: number;
  keywords: string[];
  leadTimeNote: string;
  steps: string[];
  documents: string[];
  watchOuts: string[];
}

export const KNOWLEDGE: KnowledgeEntry[] = [
  {
    kind: 'passport',
    label: 'Passport',
    category: 'document',
    lead: 120,
    keywords: ['passport', 'pasport', 'visa passport'],
    leadTimeNote: 'Most authorities ask you to apply 3-6 months before expiry. Six months is the safe window if you travel plans are not fixed.',
    steps: [
      'Confirm the remaining validity required for your destination country.',
      'Book an appointment at the nearest passport office or authorised centre.',
      'Complete the application form and pay the government fee plus service fee.',
      'Attend the appointment for photo, biometrics and document verification.',
      'Collect or receive the new passport; old one is usually cancelled at issue.',
    ],
    documents: [
      'Current passport (original)',
      'Citizenship or national ID proof',
      'Recent passport-size photos meeting official dimensions',
      'Previous passports (if any)',
      'Proof of address',
      'Fee receipt or payment reference',
    ],
    watchOuts: [
      'Names must match your ID documents exactly, including middle names.',
      'Blurred, shadowed or selfie-style photos are commonly rejected.',
      'A signature mismatch between form and ID is a frequent rejection reason.',
    ],
  },
  {
    kind: 'driving-licence',
    label: 'Driving licence',
    category: 'document',
    lead: 60,
    keywords: ['driving licence', 'driving license', 'licence renew', 'license renew', 'driver licence', 'dl renew'],
    leadTimeNote: 'Learner and provisional licences usually expire sooner than a full licence. Book a test slot early if a retest is needed.',
    steps: [
      'Check whether a vision test or medical certificate is required for your class.',
      'Apply through the licensing authority portal or an authorised service centre.',
      'Pay the renewal fee and book an appointment for document submission.',
      'Attend for photo capture and biometric update if the record has changed.',
      'Download and print the digital licence, and keep the PDF offline.',
    ],
    documents: [
      'Expiring driving licence (original)',
      'National ID or citizenship certificate',
      'Recent passport-size photos',
      'Medical or eye-test certificate (if required for the class)',
      'Proof of address',
    ],
    watchOuts: [
      'Driving with an expired licence can invalidate insurance claims.',
      'Address or name changes should be updated before renewal, not after.',
    ],
  },
  {
    kind: 'national-id',
    label: 'National ID / Citizenship',
    category: 'document',
    lead: 60,
    keywords: ['national id', 'citizenship', 'nationality', 'aadhaar', 'nid card', 'identity card', 'voter id', 'election card'],
    leadTimeNote: 'IDs are rarely urgent, but a blocked or expired ID stops bank, SIM, and passport work — so renew before you need it.',
    steps: [
      'Check for an online re-issue or correction option for your ID.',
      'If a correction is needed, submit the biometric or document update request.',
      'Attend the enrolment centre if biometric capture is required.',
      'Track the application and collect from the issuing office when notified.',
    ],
    documents: [
      'Existing ID card',
      'Proof of date of birth',
      'Citizenship or birth certificate',
      'Recent passport-size photos',
      'Proof of current address',
    ],
    watchOuts: [
      'A mismatch between your ID address and your bank record causes avoidable rejections.',
      'Phone numbers and email are usually the recovery route — keep them current.',
    ],
  },
  {
    kind: 'insurance',
    label: 'Insurance premium',
    category: 'finance',
    lead: 21,
    keywords: ['insurance', 'premium', 'policy renew', 'life insurance', 'term plan', 'mediclaim', 'renewal premium'],
    leadTimeNote: 'Insurers typically send a reminder 30 days out and expect payment within a 15-day grace window. Paying a few days early avoids a lapse.',
    steps: [
      'Compare the renewal quote against last year — premiums can rise sharply with age claims.',
      'Check the sum insured and add-ons still match your current needs.',
      'Pay through the insurer portal or official agent and save the receipt.',
      'Download the updated policy schedule and endorsements.',
    ],
    documents: [
      'Existing policy number',
      'Previous premium receipt',
      'Updated health or nominee details',
      'ID proof of the policyholder',
    ],
    watchOuts: [
      'A missed premium can lapse the policy and wipe waiting-period cover.',
      'Never pay renewal premiums to a link received in an unexpected message.',
    ],
  },
  {
    kind: 'vehicle-registration',
    label: 'Vehicle registration / tax',
    category: 'vehicle',
    lead: 30,
    keywords: ['vehicle registration', 'number plate', 'vehicle tax', 'road tax', 'car tax', 'tokensen', 'fancy number'],
    leadTimeNote: 'Road tax is usually annual and payable before the registration anniversary. Late payment adds penalties per month.',
    steps: [
      'Check the registration expiry on the certificate or number plate.',
      'Pay road tax online through the transport authority or vehicle portal.',
      'Receive the tax token / receipt electronically or at the office.',
      'Update the insurance copy that shows the new validity.',
    ],
    documents: [
      'Vehicle registration certificate',
      'Insurance certificate (valid)',
      'Emissions or fitness certificate (if the jurisdiction requires one)',
      'Owner ID proof',
    ],
    watchOuts: [
      'Driving with expired road tax invites on-the-spot fines.',
      'Fitness and insurance expiry are separate from registration expiry — track all three.',
    ],
  },
  {
    kind: 'vehicle-fitness',
    label: 'Vehicle fitness / inspection',
    category: 'vehicle',
    lead: 21,
    keywords: ['fitness', 'vehicle inspection', 'emission test', 'pollution certificate', 'puc', 'MOT', 'service due'],
    leadTimeNote: 'Periodic inspection must be booked before the certificate lapses; a lapsed certificate can stop you renewing tax.',
    steps: [
      'Book an inspection at an authorised test centre.',
      'Get the vehicle serviced and clear any warning lights beforehand.',
      'Attend the inspection and collect the certificate the same day where possible.',
    ],
    documents: ['Registration certificate', 'Insurance certificate', 'Previous inspection certificate', 'Owner ID proof'],
    watchOuts: [
      'Expired fitness certificates block tax renewal and can invalidate insurance.',
      'Keep the certificate in the vehicle — many checks are on the roadside.',
    ],
  },
  {
    kind: 'gym-membership',
    label: 'Gym / club membership',
    category: 'health',
    lead: 14,
    keywords: ['gym', 'membership', 'club', 'subscription fee', 'fitness centre', 'yoga class'],
    leadTimeNote: 'Memberships auto-renew silently. Cancel at least 5-7 days before the billing date.',
    steps: [
      'Check the renewal date and amount on the last invoice or card statement.',
      'Cancel through the official channel, not by simply stopping payment.',
      'Get the cancellation reference in writing.',
      'Return the key/fob and settle any lock-in period.',
    ],
    documents: ['Membership contract or terms', 'Last invoice', 'ID proof', 'Payment card used for auto-renewal'],
    watchOuts: [
      'Auto-debit continues after cancellation at many clubs — verify the card statement.',
      'Long lock-in contracts may need written notice to the registered address.',
    ],
  },
  {
    kind: 'medication',
    label: 'Medication refill / review',
    category: 'health',
    lead: 10,
    keywords: ['medication', 'medicine', 'refill', 'prescription', 'dose', 'tablet', 'insulin', 'review appointment', 'doctor appointment'],
    leadTimeNote: 'Never let a chronic supply run out. Request repeats 7-10 days before you are out, and never change a dose without a prescriber.',
    steps: [
      'Request the repeat or review appointment from your prescriber.',
      'Restock before you run below one week of supply.',
      'Book a review if it has been more than 6 months since your last check.',
      'Check expiry dates on everything in the cabinet and dispose of expired items safely.',
    ],
    documents: ['Current prescription or medication list', 'Last test reports', 'Allergies list', 'Pharmacy details'],
    watchOuts: [
      'This tracker is a reminder tool, not medical advice.',
      'Some medicines need monitoring bloods before renewal — ask your prescriber.',
    ],
  },
  {
    kind: 'health-checkup',
    label: 'Health check-up',
    category: 'health',
    lead: 21,
    keywords: ['checkup', 'check-up', 'screening', 'health test', 'blood test', 'mammogram', 'dental', 'eye test', 'eye exam', 'physio'],
    leadTimeNote: 'Booking a full screening package early in the calendar year avoids end-of-year clinic rushes.',
    steps: [
      'Decide which screening package matches your age and family history.',
      'Fast for the required number of hours if bloods are included — confirm with the lab.',
      'Attend the screening and keep the report for your next appointment.',
      'Schedule follow-ups for anything flagged in the report.',
    ],
    documents: ['ID and insurance card', 'Previous reports for comparison', 'Current medication list', 'Family history notes'],
    watchOuts: [
      'Compare this year\'s report against the last one — trends matter more than single readings.',
      'Not everything needs a doctor; a report with a flagged value is a good reason to book one.',
    ],
  },
  {
    kind: 'sim-card',
    label: 'SIM / phone validity',
    category: 'subscription',
    lead: 30,
    keywords: ['sim', 'sim card', 'mobile plan', 'phone number', 'telecom', 'airtime', 'postpaid', 'eSIM'],
    leadTimeNote: 'In many markets an inactive prepaid SIM is deactivated and the number is recycled after a long dormancy period.',
    steps: [
      'Check the validity date and last recharge date in the operator app.',
      'Top up before the long-expiry threshold so the number is never purged.',
      'Port the number if you are switching operators — do this before cancelling the old line.',
      'Transfer the number to the new device and update two-factor authentication.',
    ],
    documents: ['National ID', 'Current SIM and its number', 'Latest bill or recharge receipt', 'Porting code from the old operator'],
    watchOuts: [
      'Numbers are hard to recover once recycled.',
      'Porting takes days — plan the switch so you are not offline in the meantime.',
    ],
  },
  {
    kind: 'utility-bill',
    label: 'Utility bill',
    category: 'home',
    lead: 7,
    keywords: ['electricity bill', 'water bill', 'utility bill', 'electricity', 'power bill', 'internet bill', 'broadband', 'wifi bill', 'gas bill'],
    leadTimeNote: 'Bills arrive a few days before the due date. Set the reminder a week out so autopay is funded, not just the notification read.',
    steps: [
      'Confirm the autopay amount matches actual usage this cycle.',
      'Top up the source account if the balance is likely to be short.',
      'Check for a mid-cycle estimate on high-usage months.',
      'Review the tariff — a better plan can offset a big jump.',
    ],
    documents: ['Most recent bill', 'Account number', 'Meter reading (if self-reported)', 'Payment confirmation'],
    watchOuts: [
      'Disconnection and reconnection fees cost far more than a late fee.',
      'An estimated bill can be corrected — submit the meter reading early.',
    ],
  },
  {
    kind: 'rent',
    label: 'Rent / lease',
    category: 'home',
    lead: 30,
    keywords: ['rent', 'lease', 'tenancy', 'deposit', 'house rent', 'landlord'],
    leadTimeNote: 'Decide 60 days out: negotiating, packing, and finding a new place are the long-lead items, not the notice itself.',
    steps: [
      'Re-read the notice clause in the lease for the exact required period.',
      'Give written notice if you are leaving, and keep proof of delivery.',
      'Start the search early — availability, not paperwork, is the bottleneck.',
      'Schedule the joint inspection to document deposit deductions with photos.',
    ],
    documents: ['Signed lease agreement', 'Notice clause extract', 'Last rent receipt', 'Inventory / inspection photos'],
    watchOuts: [
      'Returning a deposit depends entirely on the inspection record, not on memory.',
      'Unreturned keys usually cost the full deposit in most agreements.',
    ],
  },
  {
    kind: 'warranty',
    label: 'Warranty / product cover',
    category: 'home',
    lead: 14,
    keywords: ['warranty', 'guarantee', 'laptop warranty', 'phone warranty', 'extended cover', 'receipt'],
    leadTimeNote: 'Warranty clocks start at purchase, not at delivery. The window is often shorter than you think for accessories.',
    steps: [
      'Locate the purchase invoice or order reference before contacting support.',
      'Test the device fully — intermittent faults are hard to reproduce later.',
      'Raise the claim before the expiry date; claims filed after expiry are usually declined.',
      'Save the claim reference and the replacement terms.',
    ],
    documents: ['Purchase invoice or order ID', 'Serial number / IMEI', 'Warranty card or email', 'Description of the fault'],
    watchOuts: [
      'Keep the invoice even for items bought without a physical receipt.',
      'Manufacturer warranty and shop warranty are different contracts — check both.',
    ],
  },
  {
    kind: 'credit-card',
    label: 'Credit card',
    category: 'finance',
    lead: 30,
    keywords: ['credit card', 'card expiry', 'card renew', 'card statement', 'statement date', 'due date', 'emi'],
    leadTimeNote: "Statement and due dates are fixed monthly. Mark both, plus the card's physical expiry a month earlier.",
    steps: [
      'Check the statement date and the payment due date separately.',
      'Pay at least the minimum, and the full balance if you can avoid interest.',
      'Check for an annual fee and ask for a waiver if you are a long-term customer.',
      'Update the new expiry date in every recurring payment you own.',
    ],
    documents: ['Card number and expiry', 'Statement', 'Payment confirmation', 'Statement-cycle contact if disputing'],
    watchOuts: [
      'A late payment reports to credit bureaus and can raise the cost of your next loan.',
      'Recurring subscriptions silently break when a card expires.',
    ],
  },
  {
    kind: 'bank-kyc',
    label: 'Bank KYC / passbook',
    category: 'finance',
    lead: 45,
    keywords: ['kyc', 'passbook', 'bank account', 'dormant account', 'account update', 'pan card', 'tax id'],
    leadTimeNote: 'Banks flag accounts as dormant after long inactivity, which then blocks crediting and online banking.',
    steps: [
      'Check whether the account has been flagged as dormant or frozen.',
      'Complete pending KYC: address proof, photo, and signature specimen.',
      'Update your phone number and email — recovery runs through them.',
      'Ask for written confirmation that KYC is fully closed.',
    ],
    documents: ['National ID', 'Proof of current address', 'Passport-size photo', 'Signature specimen', 'Existing passbook or card'],
    watchOuts: [
      'A failed KYC can freeze withdrawals, not just transfers.',
      'The phone number on file is the single most important recovery detail.',
    ],
  },
  {
    kind: 'subscription',
    label: 'Subscription / free trial',
    category: 'subscription',
    lead: 3,
    keywords: ['subscription', 'netflix', 'spotify', 'youtube', 'prime', 'free trial', 'membership fee', 'icloud', 'dropbox', 'chatgpt'],
    leadTimeNote: 'Free trials auto-convert silently. Remind yourself one day before the trial ends, not on the charge date.',
    steps: [
      'List every active trial and the date it converts to paid.',
      'Cancel immediately anything you do not actively use.',
      'Set a cancellation reminder the day after each renewal to verify the charge stopped.',
      'Check for cheaper annual or family plans.',
    ],
    documents: ['Account confirmation email', 'Payment card on file', 'Renewal date or trial end date'],
    watchOuts: [
      'Cancel at least 24 hours before the renewal timestamp, not on the day.',
      'Removing an app does not cancel an in-app subscription.',
    ],
  },
  {
    kind: 'tax-filing',
    label: 'Tax filing',
    category: 'finance',
    lead: 45,
    keywords: ['tax', 'tax return', 'filing', 'income tax', 'itr', 'revenue', 'pan', 'tds', 'vat', 'gst'],
    leadTimeNote: 'Filing windows usually open mid-year and close on a hard deadline with penalties after. Missing the date cannot be waived.',
    steps: [
      'Gather all income documents, including bank interest and rental income.',
      'Reconcile reported income against your bank statements and payslips.',
      'File and pay any balance before the deadline.',
      'Save the acknowledgement and the payment receipt.',
    ],
    documents: ['Annual income statement / payslips', 'Bank statements for the full year', 'Previous year return', 'Taxpayer ID', 'Expense receipts for claimable items'],
    watchOuts: [
      'Pre-estimated instalments are offsets, not replacements — you still have to file.',
      'Reconcile reported income with your records before filing; mismatches are the top audit trigger.',
    ],
  },
  {
    kind: 'work-permit',
    label: 'Work permit / visa',
    category: 'work',
    lead: 90,
    keywords: ['work permit', 'work visa', 'residence permit', 'employment visa', 'dependent visa', 'labour card'],
    leadTimeNote: 'Permit and visa processing is the longest lead item in most life-admin lists. Start 3 months out, sooner for dependent or employer-sponsored routes.',
    steps: [
      'Confirm which authority issues the permit and the current processing time.',
      'Collect sponsor documents: contract, salary proof, company registration.',
      'Submit the application and track it until it is issued.',
      'Report arrival and complete any local registration within the stated window.',
    ],
    documents: ['Passport copy', 'Employment contract', 'Sponsor / employer letter', 'Educational and professional certificates', 'Police and medical clearance (if required)', 'Photographs'],
    watchOuts: [
      'A permit expiring during a renewal application can end your status abruptly.',
      'Check whether dependents must apply in the same window as the primary applicant.',
    ],
  },
  {
    kind: 'business-registration',
    label: 'Business registration / licence',
    category: 'work',
    lead: 60,
    keywords: ['business licence', 'company registration', 'trade licence', 'shop licence', 'incorporation', 'pan card business', 'sole proprietor'],
    leadTimeNote: 'Trade and shop licences usually renew annually around the incorporation or registration anniversary.',
    steps: [
      'Check the licence expiry on the certificate and the local authority portal.',
      'Gather the annual statements: turnover, premises proof, and tax clearance.',
      'Apply for renewal and pay the fee before the expiry date.',
      'Display the renewed licence at the premises where required.',
    ],
    documents: ['Existing licence or registration certificate', 'Tax clearance / return filing proof', 'Premises ownership or lease', 'Owner ID', 'Bank account details'],
    watchOuts: [
      'Operating after expiry can mean fines far larger than the renewal fee.',
      'Premises changes usually need a separate amendment — tell the authority before you move.',
    ],
  },
  {
    kind: 'device-support',
    label: 'Device backup / plan change',
    category: 'subscription',
    lead: 7,
    keywords: ['backup', 'data transfer', 'new phone', 'upgrade phone', 'device wipe', 'migration', 'sim swap', 'phone upgrade'],
    leadTimeNote: 'Transfers fail on low battery, locked accounts, and missing 2FA codes. Charge the device and confirm your recovery codes first.',
    steps: [
      'Charge both devices fully and connect to reliable power and Wi-Fi.',
      'Confirm you know the account password and have your two-factor codes ready.',
      'Back up before you wipe, and verify the backup completed before deleting anything.',
      'After the switch, confirm that photos, messages and authenticator apps moved correctly.',
    ],
    documents: ['Account credentials', 'Two-factor recovery codes', 'Cloud account access', 'Charger and cable'],
    watchOuts: [
      'Authenticator apps are the most commonly forgotten item in a migration.',
      'Never wipe until you have verified the new device works on cellular data.',
    ],
  },
  {
    kind: 'birth-certificate',
    label: 'Birth / civil certificate',
    category: 'document',
    lead: 30,
    keywords: ['birth certificate', 'birth registration', 'marriage certificate', 'death certificate', 'civil registration', 'relationship certificate'],
    leadTimeNote: 'Civil registrations are usually needed for school, insurance, and property work. Request certified copies well before the deadline you are working towards.',
    steps: [
      'Apply to the civil registration authority for a certified copy.',
      'Provide the required identity and relationship proof.',
      'Collect the certificate and verify names and dates against your other records.',
      'Request extra certified copies for institutions that keep one.',
    ],
    documents: ['Request form', 'Identity proof of the applicant', 'Relationship proof for the person named', 'Parent details for a birth registration', 'Fee'],
    watchOuts: [
      'Corrections after registration are slow — check names and dates carefully on issue.',
      'Some institutions will not accept digital copies; certified paper copies are safer.',
    ],
  },
  {
    kind: 'travel-document',
    label: 'Travel / booking hold',
    category: 'document',
    lead: 21,
    keywords: ['flight', 'booking', 'hotel', 'travel', 'holiday', 'trip', 'visa appointment', 'itinerary'],
    leadTimeNote: 'Passport validity and visa appointment availability are the two things that can invalidate a whole trip. Check them first.',
    steps: [
      'Confirm passport validity exceeds the destination requirement for the whole trip.',
      'Check visa appointment lead times and book before paying non-refundable costs.',
      'Keep copies of bookings, insurance and itinerary accessible offline.',
      'Register with your embassy travel advisory service if you are going somewhere advised against.',
    ],
    documents: ['Valid passport', 'Visa or ETA confirmation', 'Return tickets', 'Travel insurance policy', 'Accommodation booking', 'Emergency contact list'],
    watchOuts: [
      'Some destinations require 6 months passport validity beyond your travel dates.',
      'Offline copies matter — phone theft abroad is a common trap.',
    ],
  },
  {
    kind: 'loan-emi',
    label: 'Loan / EMI schedule',
    category: 'finance',
    lead: 5,
    keywords: ['loan', 'emi', 'mortgage', 'installment', 'repayment', 'financing', 'hiring purchase'],
    leadTimeNote: 'EMIs debit on a fixed date. Fund the account the day before rather than on the date.',
    steps: [
      'Note the debit date and make sure the account holds the instalment amount.',
      'Keep the repayment schedule handy for early-closure calculations.',
      'Check the outstanding principal before taking any early-closure decision.',
      'Collect the no-dues letter once the loan closes.',
    ],
    documents: ['Loan agreement', 'Repayment schedule', 'Latest statement', 'No-dues letter (after closure)'],
    watchOuts: [
      'Missing an EMI drops you into recovery and damages your credit file.',
      'Prepayment penalties are common — check the clause before settling early.',
    ],
  },
  {
    kind: 'domestic-help',
    label: 'Household / service renewal',
    category: 'home',
    lead: 30,
    keywords: ['housekeeper', 'domestic help', 'cook', 'driver', 'cleaner', 'watchman', 'service contract', 'pest control'],
    leadTimeNote: 'Annual service contracts renew around the start of the contract month. Re-quote before renewing — the first-year price is rarely the market price.',
    steps: [
      'Re-quote the service or contract before the renewal date.',
      'Confirm what is included and what is charged extra.',
      'Agree and record the terms, including notice and payment schedule.',
      'Review service quality and references before you renew.',
    ],
    documents: ['Existing contract or agreement', 'Payment records', 'Service references', 'ID or address details for the service provider'],
    watchOuts: [
      'Written terms protect both sides; verbal renewals are the usual source of disputes.',
      'Keep payment records — they are your leverage in any renewal negotiation.',
    ],
  },
  {
    kind: 'password-audit',
    label: 'Account security review',
    category: 'digital',
    lead: 30,
    keywords: ['password', 'password change', 'two factor', '2fa', 'account security', 'breach', 'security check', 'recovery'],
    leadTimeNote: 'Rotate credentials after any breach notification, and move high-value accounts to a password manager and app-based 2FA.',
    steps: [
      'List the accounts that hold money, identity documents, or primary email.',
      'Move each to a unique generated password in a password manager.',
      'Replace SMS 2FA with an authenticator app or hardware key where offered.',
      'Store recovery codes offline, in a different place from the device.',
      'Check for the same password reused anywhere else and change those too.',
    ],
    documents: ['Password manager master credentials', 'Recovery codes', 'Device list from the main email account', 'List of accounts to rotate'],
    watchOuts: [
      'Your primary email account is the master key — secure it first and hardest.',
      'Never store recovery codes in the same password manager entry as the account.',
    ],
  },
  {
    kind: 'student-enrolment',
    label: 'Course / scholarship form',
    category: 'work',
    lead: 21,
    keywords: ['course', 'school', 'college', 'university', 'enrolment', 'enrollment', 'scholarship', 'exam', 'transcript', 'marksheet'],
    leadTimeNote: 'Form deadlines are fixed and inflexible. Missing one often means waiting a whole academic cycle.',
    steps: [
      'Collect the transcripts and certificates the form requires.',
      'Prepare a single document folder so you are not hunting for files.',
      'Submit before the deadline — do not rely on the last day.',
      'Save the confirmation number and the payment receipt.',
    ],
    documents: ['Transcripts / marksheets', 'Certificates', 'ID proof', 'Statement of purpose or personal statement', 'Recommendation letters (if required)', 'Passport-size photos'],
    watchOuts: [
      'Scholarship forms often have an earlier deadline than the admission form.',
      'Check whether the deadline is local time in the institution\'s country.',
    ],
  },
  {
    kind: 'charity-giving',
    label: 'Regular donation',
    category: 'finance',
    lead: 3,
    keywords: ['donation', 'charity', 'sponsor', 'monthly giving', 'subscription charity', 'giving'],
    leadTimeNote: 'Review regular giving once a year so it stays deliberate rather than accidental.',
    steps: [
      'List every recurring donation and the total monthly amount.',
      'Cancel or reduce anything you no longer want automatically.',
      'Keep a single annual statement for your own records.',
    ],
    documents: ['Bank or card statements', 'Donation receipts', 'Confirmation of recurring mandate'],
    watchOuts: [
      'Confirm any organisation is registered before setting up a recurring mandate.',
    ],
  },
];

export const DEFAULT_ENTRY: KnowledgeEntry = {
  kind: 'general',
  label: 'General task',
  category: 'other',
  lead: 14,
  keywords: [],
  leadTimeNote: 'Set a lead time based on how long this actually takes you, not on the due date.',
  steps: [
    'Write down what "done" looks like for this item in one sentence.',
    'Break it into the smallest first action you can do in under 10 minutes.',
    'Block the time in your calendar now, before it becomes urgent.',
    'Do the first action, then schedule the rest.',
  ],
  documents: ['Any reference numbers, receipts or correspondence for this task'],
  watchOuts: ['If this involves money, identity or a government office, expect a form and a fee.'],
};

export const JURISDICTIONS: Jurisdiction[] = ['NP', 'IN', 'AE', 'US', 'UK', 'OTHER'];

export const JURISDICTION_LABEL: Record<Jurisdiction, string> = {
  NP: 'Nepal',
  IN: 'India',
  AE: 'UAE',
  US: 'United States',
  UK: 'United Kingdom',
  OTHER: 'Other',
};

export const CATEGORY_LABEL: Record<Category, string> = {
  document: 'Documents',
  finance: 'Money',
  health: 'Health',
  vehicle: 'Vehicle',
  subscription: 'Subscriptions',
  home: 'Home',
  work: 'Work & study',
  digital: 'Digital',
  other: 'Other',
};

export const CATEGORY_ICON: Record<Category, string> = {
  document: '\u{1F4C4}',
  finance: '\u{1F4B8}',
  health: '\u{1FA7A}',
  vehicle: '\u{1F697}',
  subscription: '\u{1F516}',
  home: '\u{1F3E0}',
  work: '\u{1F4BC}',
  digital: '\u{1F510}',
  other: '\u{2022}',
};

export function entryFor(kind: string): KnowledgeEntry {
  return KNOWLEDGE.find((e) => e.kind === kind) ?? DEFAULT_ENTRY;
}

export const GENERAL_CATEGORIES: Category[] = [
  'document',
  'finance',
  'health',
  'vehicle',
  'subscription',
  'home',
  'work',
  'digital',
];
