```
graph TB
    Start[Claim Application Received] --> GetVehicle[Retrieve Vehicle Specs - G401E<br/>TG4E01-06 Tables]
    
    GetVehicle --> ValidateVehicle{Vehicle<br/>Eligible?}
    ValidateVehicle -->|No| RejectClaim[Reject Claim<br/>Vehicle Not Eligible]
    ValidateVehicle -->|Yes| ValidateDealer[Validate Dealer Authorization<br/>Dealer Master]
    
    ValidateDealer --> CheckDealer{Dealer<br/>Authorized?}
    CheckDealer -->|No| RejectClaim
    CheckDealer -->|Yes| ProcessLabor[Process Labor Lines]
    
    ProcessLabor --> ValidateLabor[Validate Labor Codes - TG4G39<br/>Campaign Order Labor Master]
    ValidateLabor --> CalcLabor[Calculate Labor Amounts<br/>Hours × Rate × Payment Rate]
    CalcLabor --> ApproveLabor{Labor<br/>Approved?}
    ApproveLabor -->|Yes| AddApprovedLabor[Add to Approved Labor Amount]
    ApproveLabor -->|No| AddDisapprovedLabor[Add to Disapproved Labor Amount]
    
    AddApprovedLabor --> ProcessParts[Process Parts Lines]
    AddDisapprovedLabor --> ProcessParts
    
    ProcessParts --> ValidateParts[Validate Part Numbers - TG4A14<br/>Parts Master]
    ValidateParts --> CalcParts[Calculate Parts Amounts<br/>Price + Tax]
    CalcParts --> ApproveParts{Parts<br/>Approved?}
    ApproveParts -->|Yes| AddApprovedParts[Add to Approved Parts Amount]
    ApproveParts -->|No| AddDisapprovedParts[Add to Disapproved Parts Amount]
    
    AddApprovedParts --> SumAmounts[Sum Total Approved and Disapproved]
    AddDisapprovedParts --> SumAmounts
    
    SumAmounts --> DetermineJudgment{Judgment<br/>Decision}
    DetermineJudgment -->|Approved > 0<br/>Disapproved = 0| FullApproval[Full Approval]
    DetermineJudgment -->|Approved > 0<br/>Disapproved > 0| PartialApproval[Partial Approval]
    DetermineJudgment -->|Approved = 0<br/>Disapproved > 0| FullDisapproval[Full Disapproval]
    
    FullApproval --> WriteResults[Write Judgment Results<br/>Claim Transaction Tables]
    PartialApproval --> WriteResults
    FullDisapproval --> WriteResults
    RejectClaim --> WriteResults
    
    WriteResults --> SendToRecovery[Send to Claim Recovery - G401A]
    SendToRecovery --> SendToIndemnity[Send to Indemnity Judgment - G401B]
    SendToIndemnity --> SendToAccounting[Send to Accounting - G432]
    SendToAccounting --> SendToStatistics[Send to Quality Statistics - G401J]
    SendToStatistics --> End[Judgment Complete]
```

```
graph TB
    Start[Monthly Trigger] --> ExtractData[Extract Claim Recovery Data - TG4B]
    ExtractData --> CalcIndemnity[Calculate Indemnity Amounts - G401B14C]
    CalcIndemnity --> CheckThreshold{Amount > Threshold?}
    
    CheckThreshold -->|Yes| ManualApproval[Route to Approval Workflow]
    CheckThreshold -->|No| AutoApprove[Auto Approve]
    
    ManualApproval --> UpdateStatus[Update Status - TG4B]
    AutoApprove --> UpdateStatus
    
    UpdateStatus --> SendPayment[Send Payment Instructions - G432]
    
    ExtractData --> CreateMFTE[Create MFTE Unreimbursed DB - @G401B13]
    CreateMFTE --> AssignMFTE[Assign to MFTE Experts]
    AssignMFTE --> SendMFTEData[Send MFTE Data Files]
    
    ExtractData --> ValidateMileage[Validate Mileage - Imported Vehicles]
    ValidateMileage --> MileageReport[Generate Inconsistency Report]
    
    ExtractData --> JudgeParts[Parts Manufacturer Judgment]
    JudgeParts --> PartsBilling[Generate Parts Mfg Billing]
    
    ExtractData --> Confirm[Claim Recovery Confirmation - @G401B22]
    Confirm --> CheckVariance{Variance > 5%?}
    CheckVariance -->|Yes| Investigation[Flag for Investigation]
    CheckVariance -->|No| ConfirmOK[Mark Confirmed]
    
    ConfirmOK --> SendPayment
    Investigation --> ManualReview[Manual Review Queue]
    
    SendPayment --> Backup[Create Backup Files - PROD1.GX4B]
    SendMFTEData --> Stats[Send to Statistics - G401J]
    MileageReport --> Stats
    PartsBilling --> Stats
    
    Stats --> End[Processing Complete]
```

```
graph TB
    Start[Claim Data Input] --> Validate[Validate Claim Eligibility]
    Validate --> |Valid| RetrieveMaster[Retrieve Master Data - TG4E, TG4G]
    Validate --> |Invalid| ErrorReport[Generate Error Report]
    
    RetrieveMaster --> CalcLabor[Calculate Labor Amount]
    CalcLabor --> CalcParts[Calculate Parts Amount]
    CalcParts --> DetermineRate[Determine Recovery Rate]
    
    DetermineRate --> ApplyAdjust[Apply Business Rule Adjustments]
    ApplyAdjust --> CalcFinal[Calculate Final Recovery Amount]
    CalcFinal --> ApplyTax[Apply Tax Calculations]
    
    ApplyTax --> WriteVSAM[Write to VSAM File]
    WriteVSAM --> UpdateDB[Update TG4A Tables]
    UpdateDB --> CheckThreshold{Amount > Approval Threshold?}
    
    CheckThreshold --> |Yes| ManualApproval[Route for Manual Approval]
    CheckThreshold --> |No| AutoApprove[Auto Approve]
    
    ManualApproval --> SendAccounting[Send to Accounting - G432]
    AutoApprove --> SendAccounting
    
    SendAccounting --> SendStats[Send to Statistics - G401J]
    SendStats --> End[Processing Complete]
    
    ErrorReport --> End
    
    G401M[Domestic Claims - G401M] --> Start
    G422[Overseas Claims - G422] --> Start
    G412[Master Data - G412] --> RetrieveMaster
```

```
graph TB
    Start[Daily Trigger 23:00] --> ExtractClaims[Extract Claim Data - TG4P, TG4M]
    ExtractClaims --> FilterClaims[Filter for FALCON Transmission]
    FilterClaims --> SortData[Sort by VIN, Date, Dealer - G401F01C]
    SortData --> MergeData[Merge Duplicate Records]
    
    MergeData --> ConvertVIN[Convert VIN Format]
    ConvertVIN --> ConvertDate[Convert Date Format]
    ConvertDate --> ConvertAmount[Convert Amount Format]
    ConvertAmount --> MapCodes[Map Component Codes - TG4F]
    MapCodes --> ConvertEncoding[Convert Character Encoding]
    
    ConvertEncoding --> ValidateData[Validate Converted Data]
    ValidateData --> |Valid| WriteValid[Write to FALCON File]
    ValidateData --> |Invalid| WriteError[Write to Error Report]
    
    WriteValid --> UpdateStatus[Update Status to FALCON-transmitted]
    WriteError --> UpdateError[Update Status to FALCON-error]
    
    UpdateStatus --> TransmitFile[Transmit via SFTP to FALCON]
    TransmitFile --> |Success| WaitAck[Wait for Acknowledgment]
    TransmitFile --> |Failure| RetryTransmit{Retry < 3?}
    
    RetryTransmit --> |Yes| TransmitFile
    RetryTransmit --> |No| SendErrorEmail[Send Error Email - @G401F02]
    
    WaitAck --> |Received| ProcessAck[Process FALCON Response]
    WaitAck --> |Timeout| SendAlert[Send Alert Email]
    
    ProcessAck --> UpdateFinal[Update Final Status - TG4F]
    UpdateError --> SendErrorEmail
    
    UpdateFinal --> GenStats[Generate Statistics]
    SendErrorEmail --> GenStats
    SendAlert --> GenStats
    
    GenStats --> SendStatsData[Send to Statistics - G401J]
    SendStatsData --> End[Processing Complete]
```

```
graph TB
    Start[Bulletin Creation Request] --> ValidateContent[Validate Bulletin Content - G401C24C]
    ValidateContent --> |Valid| AssignNumber[Assign Bulletin Number]
    ValidateContent --> |Invalid| ErrorReport[Generate Error Report]
    
    AssignNumber --> RetrieveModels[Retrieve Vehicle Models - TG4E]
    RetrieveModels --> DetermineTargets[Determine Target Dealers]
    DetermineTargets --> ApprovalWorkflow[Route for Approval]
    
    ApprovalWorkflow --> |Approved| StoreData[Store in TG4C Tables]
    ApprovalWorkflow --> |Rejected| ErrorReport
    
    StoreData --> CheckSeverity{TSB Severity?}
    CheckSeverity --> |Urgent| ImmediateDistrib[Immediate Distribution + Email]
    CheckSeverity --> |Standard| WeeklyPackage[Add to Weekly Package]
    CheckSeverity --> |PIB| ScheduledDistrib[Scheduled Distribution]
    
    ImmediateDistrib --> SendDealers[Send to Dealers - G462]
    WeeklyPackage --> SendDealers
    ScheduledDistrib --> SendDealers
    
    SendDealers --> TrackAck[Track Acknowledgment]
    TrackAck --> CheckAck{Acknowledged?}
    CheckAck --> |No| SendReminder[Send Reminder]
    CheckAck --> |Yes| UpdateTracking[Update Tracking - TG4C]
    
    SendReminder --> TrackAck
    UpdateTracking --> GenStats[Generate Statistics - G401C20C]
    GenStats --> SendStatsData[Send to Statistics - G401J]
    
    SendStatsData --> Archive[Archive Bulletin]
    Archive --> End[Processing Complete]
    
    ErrorReport --> End
```

```
graph TB
    Start[Scheduled Batch Trigger] --> ExtractVehicle[Extract Vehicle Data - G401H76C<br/>TAPEG.G401E30.BAC0]
    
    ExtractVehicle --> SortVehicle[Sort and Deduplicate VIN<br/>VIN, Chassis Type, Chassis Number]
    
    SortVehicle --> ExtractClaim[Extract Claim Payment Data - G401H05C<br/>TAPEG.G401J49.DAC/DOM-ACC]
    ExtractClaim --> ClaimHeader[Claim Header - PRODT.G401H02.HEADDAC]
    ExtractClaim --> ClaimLabor[Labor Data - PRODT.G401H16.LBRDAC]
    ExtractClaim --> ClaimParts[Parts Data - PRODT.G401H17.PATDAC]
    ExtractClaim --> ClaimNarrative[Narrative Data]
    
    ClaimHeader --> SortHeader1[Sort by Reference Number]
    SortHeader1 --> ConvertParts[Convert Parts Names - G401H37C<br/>TAPEG.G410.PP0]
    ConvertParts --> SortHeader2[Sort by Reference Number]
    SortHeader2 --> SortHeader3[Sort by VIN, RefNo, Date]
    SortHeader3 --> InitialRepair[Assign Initial Repair Flag - G401H20C]
    
    SortVehicle --> SortVehicle2[Sort by VIN]
    SortVehicle2 --> AttachCompVehicle[Attach Component Info - G401H52C<br/>TAPEG.G401H39.COMPO]
    AttachCompVehicle --> VehicleOut[PRODT.G401H01.VCLDAC]
    
    InitialRepair --> AttachCompHeader[Attach Component Info - G401H51C<br/>TAPEG.G401H39.COMPO]
    AttachCompHeader --> HeaderOut[PRODT.G401H02.HEADDAC]
    
    ClaimNarrative --> SortNarrative[Sort by Reference Number]
    SortNarrative --> ExpandNarrative[Expand Narrative Text - G401H16C]
    ExpandNarrative --> NarrativeOut[PRODT.G401H10.APLDAC]
    
    HeaderOut --> HULFT1[HULFT Transmit WGWX001<br/>Claim Header to Cognos]
    ClaimLabor --> HULFT2[HULFT Transmit WGWX002<br/>Labor to Cognos]
    ClaimParts --> HULFT3[HULFT Transmit WGWX003<br/>Parts to Cognos]
    NarrativeOut --> HULFT4[HULFT Transmit WGWX004<br/>Narrative to Cognos]
    VehicleOut --> HULFT5[HULFT Transmit WGWX005<br/>Vehicle to Cognos]
    
    HULFT1 --> End[Batch Complete]
    HULFT2 --> End
    HULFT3 --> End
    HULFT4 --> End
    HULFT5 --> End
    
    Start2[Non-Application Claim Trigger] --> ExtractNonApp[Extract Non-Application Claims - G401H21C<br/>DB2G.TG4J20]
    ExtractNonApp --> SortNonApp[Sort by Model, Year, Equipment]
    SortNonApp --> HULFT6[HULFT Transmit WGWX041<br/>Non-Application to Cognos]
    HULFT6 --> End2[Batch Complete]
```

```
graph TB
    Start[Monthly Schedule Trigger] --> ExtractMaster[Extract Master Data - @G401D00]
    ExtractMaster --> ValidateData[Validate Data Integrity]
    ValidateData --> GenSnapshot[Generate Master Snapshot]
    GenSnapshot --> DistributeData[Distribute to Downstream Systems]
    
    ExtractMaster --> BackupTape[Create Backup Tape - @G401D01]
    BackupTape --> BackupClaim[Backup Claim Data - TG4P]
    BackupClaim --> BackupMaster[Backup Master Data - TG4E, TG4G]
    BackupMaster --> BackupLogs[Backup Transaction Logs]
    BackupLogs --> VerifyBackup[Verify Backup Integrity]
    VerifyBackup --> OffSite[Coordinate Off-site Storage]
    
    Start --> SubsysControl[Subsystem Control Commands]
    SubsysControl --> CheckAuth[Check Authorization - G401D05C]
    CheckAuth --> |START| StartSubsys[Start Subsystem]
    CheckAuth --> |STOP| StopSubsys[Stop Subsystem]
    CheckAuth --> |STATUS| CheckStatus[Check Subsystem Status]
    
    StartSubsys --> UpdateStatus[Update Subsystem Status]
    StopSubsys --> UpdateStatus
    CheckStatus --> UpdateStatus
    
    Start --> AccessControl[User Login Request]
    AccessControl --> AuthUser[Authenticate User - G401D05C]
    AuthUser --> |Valid| CheckRole[Check Role - TG4D02]
    AuthUser --> |Invalid| LockAccount[Increment Failed Count]
    CheckRole --> CreateSession[Create User Session]
    CreateSession --> LogAccess[Log Access Event - TG4D01]
    
    Start --> GenMonitor[Generate Monitoring List - @G401D30]
    GenMonitor --> CalcStats[Calculate Monthly Statistics]
    CalcStats --> FormatReport[Format Monitoring Report]
    FormatReport --> SendEmail[Send via Email]
    SendEmail --> ArchiveReport[Archive Report]
    
    DistributeData --> End[Processing Complete]
    OffSite --> End
    UpdateStatus --> End
    LogAccess --> End
    ArchiveReport --> End
```

```
graph TB
    Start[Daily/Monthly Trigger] --> Emergency[Emergency Recall Inspection - @G462B11]
    Start --> Reception[Vehicle Data Reception - @G462E1]
    Start --> Distribution[SCOPE Distribution - @G462F14]
    
    Emergency --> ExtractClaim[Extract from TG4F05 Claim History<br/>Filter: CLMTYP=S, HISTID=space, EDTCD=A/B]
    ExtractClaim --> JoinDealer[Join TG4G16 Dealer Master<br/>Match DLRCD, DEID=D]
    JoinDealer --> FilterComp[Filter Component Codes<br/>S00261, C00133, R11055-R19999]
    FilterComp --> FormatCSV[Format CSV - G462B03C<br/>Convert periods to commas]
    FormatCSV --> OutputCSV[Output PRODA.G460B00.F051]
    OutputCSV --> BackupEmerg[Backup TAPEG.G460B00.F051]
    
    Reception --> ReadFTP[Read FTP Data<br/>PRODA.G460AE1.FB250<br/>PRODA.G460AE2.FB150]
    ReadFTP --> AppendCDR[Append CDR Data<br/>PRODA.G460CDR.GR01/GR02]
    AppendCDR --> BackupMonth[Monthly Backup<br/>TAPEG.G460.AE1T/AE2T]
    BackupMonth --> MergeCumul[Merge with Previous<br/>Create Cumulative TAPEG.G460.AE1R/AE2R]
    MergeCumul --> BackupCopy[Backup Copy<br/>TAPEG.G460.AE1R-BK/AE2R-BK]
    BackupCopy --> ClearFTP[Clear FTP Files to Zero Records]
    
    Distribution --> ExtractTape[Extract from Tape<br/>TAPEG.G460F58.SYARYO]
    ExtractTape --> SortDealer[Sort by Dealer Code<br/>Position 206]
    SortDealer --> GenReport[Generate Count Report<br/>EASY Utility]
    GenReport --> ProcessDealer[Process Each Dealer - G462F07C<br/>Codes 1102-8802]
    ProcessDealer --> CreateTrans[Create Transmission Files<br/>PRODT.G460CDS.GS11.Dxxxx]
    CreateTrans --> CreateReq[Create Request Files<br/>PRODT.G460CDS.GS11.Rxxxx]
    CreateReq --> CheckEnv{Environment<br/>Flag?}
    CheckEnv -->|Test| TransTest[Transmit to Test Environment]
    CheckEnv -->|Production| TransProd[Transmit to Production]
    TransTest --> ConnectDirect[Connect Direct Distribution]
    TransProd --> ConnectDirect
    ConnectDirect --> DealerSys[Dealer Systems]
    
    BackupEmerg --> End[Processing Complete]
    ClearFTP --> End
    DealerSys --> End
```

```
graph TB
    DesignData[Design Data from Engineering - TAPEG.K701BM2.TEKIYO] --> SpecDB[Specification Database Maintenance - @G401E21]
    DomesticProd[Domestic Production - PRODA.D722C01.GOSYA] --> VehHistory[Vehicle History Integration - @G401E27]
    ExportProd[Export Production - PRODA.D101K51.TRUCK] --> VehHistory
    EastMfg[East Manufacturing - PRODA.G401E27.TWG029] --> VehHistory
    BusData[Bus Vehicle Data - PRODA.G401E28.TWG030] --> VehHistory
    CompletionData[Completion Data - PRODA.G401E91.TRN] --> VehHistory
    OverseasEDI[Overseas EDI - PRODA.X703EDI.DTH002] --> EDIProcess[Overseas EDI Processing - @G401E31]
    
    SpecDB --> TG4E01[TG4E01 Specification DB]
    SpecDB --> TG4E02[TG4E02 Basic Spec Definition]
    SpecDB --> TG4E03[TG4E03 Basic Spec Items]
    SpecDB --> TG4E05[TG4E05 Vehicle History Auxiliary]
    SpecDB --> TG4E06[TG4E06 Option Spec Items]
    
    VehHistory --> VINDedup[VIN Deduplication - G401E46C]
    VINDedup --> VehHistoryFile[Vehicle History Files]
    
    EDIProcess --> MTEAccum[MTE Data Accumulation - TAPEG.G401E32.DTH002R]
    
    TG4E01 --> TapeBackup[Monthly Tape Backup - TAPEG.G401]
    TG4E02 --> TapeBackup
    TG4E03 --> TapeBackup
    TG4E05 --> TapeBackup
    TG4E06 --> TapeBackup
    
    VehHistoryFile --> StatData[Statistical Data Generation - @G401E29]
    VehHistoryFile --> TenYearArchive[10-Year Archive - @G401E30]
    
    TG4E01 --> ClaimJudgment[Claim Judgment Systems - G401M/G422]
    TG4E05 --> ClaimJudgment
    VehHistoryFile --> ClaimJudgment
    
    VehHistoryFile --> RecallSystem[Recall Follow-up - G472]
    TG4E01 --> DealerInfo[Dealer Information - G462]
    VehHistoryFile --> QualityStats[Quality Statistics - G401J]
    
    StatData --> CognosBI[Cognos BI Distribution]
    TenYearArchive --> TapeStorage[Tape Storage - TAPEG.G401E44.Y10]
```

```
graph TB
    NissanClaim[Nissan OEM Claim Data - PRODG.G480J02.CLAM-T] --> ClaimTransform[G482J02C - Claim Transformation - @G482J01]
    ClaimTransform --> TG4P05[OEM Claim Header DB - DB2G.TG4P05]
    TG4P05 --> CodeConv[G482J11C - Code Conversion - @G482J04]
    CodeConv --> PartsMatch[G482J13C - Parts Name Assignment]
    PartsMaster[Parts Master - TAPEG.G410.PP0] --> PartsMatch
    PartsMatch --> VehMatch[G482J12C - Vehicle History Matching]
    VehicleHistory[Vehicle History - TAPEG.G401E44.VINDOM] --> VehMatch
    VehMatch --> AcctAssign[G482J16C - Accounting Order Assignment]
    AcctAssign --> DupCheck[G482J18C - Duplicate Claim Check]
    DupCheck --> StatusOrg[G482J27C - Status Organization]
    StatusOrg --> AcctSystem[G432 - Accounting Connection System]
```

```
graph TB
    Start[Claim Application Sources] --> Intake[Claim Application Intake - @G422E0]
    
    Intake --> |Punch: DES.G420EE| Validate[Application Validation - G422E02C]
    Intake --> |Tape: PRODG.G420E00.EE0-MTT| Validate
    Intake --> |FTP: PRODA.G420E01.WSC| Validate
    Intake --> |CPU Transmission| Validate
    
    Validate --> Sort1[Sort by DE/CLMNO/CLMSUBNO/PG/LN]
    Sort1 --> Store1[Store to TAPEG.G420.EX1]
    
    ErrorSource[Error Correction Sources] --> ErrorIntake[Error Correction Intake - @G422E1]
    ErrorIntake --> |Punch: DES.G420ECE| ErrorEdit[Error Correction Edit - G422E51C]
    ErrorIntake --> |FTP: PRODA.G420E00.ECE| ErrorEdit
    
    ErrorEdit --> PendingExtract[Extract Pending Corrections - Record ID 'S']
    PendingExtract --> StorePending[Store to PRODT.G420EMS]
    
    ErrorEdit --> ReappExtract[Extract Reapplications - Record ID 'R']
    ReappExtract --> ReappDist[Reapplication Distribution - G422E53C]
    ReappDist --> StoreReapp1[Immediate: PRODA.G420ERA.ERA]
    ReappDist --> StoreReapp2[Deferred: PRODT.G420ERR]
    ReappDist --> StoreReapp3[Appeal: PRODA.G420EG2.APL]
    
    OnlineEntry[Online Entry VSAM - PROD1.GX4EE1] --> Backup[Backup to Disk - @G422E2]
    Backup --> Extract[Extract Valid Entries]
    Extract --> Merge[Merge with TAPEG.G420.EX1]
    Merge --> ErrorCheck[Reproducibility Error Check - G422E03C]
    ErrorCheck --> IncidentEdit[Claim Incident Edit - G422E04C]
    IncidentEdit --> StoreIncident[Store to PRODT.G420EH1/EB1]
    
    HistData[Historical Judgment - TAPEG.G420.EZ3N] --> HistPrep[Historical Data Preparation - @G422E5]
    HistPrep --> VINSort[Sort by VIN]
    VINSort --> VINMatch[VIN History Matching - G422E10C]
    
    StoreIncident --> HeaderMatch[Header-Body Matching - G422E85C]
    VINMatch --> HeaderMatch
    DateMaster[Date Master - PRODA.G410ZZ0.ZZ0] --> HeaderMatch
    
    HeaderMatch --> CompValid[Component Code Validation - G422E86C]
    CompMaster[Component Master - PRODA.G410CP0.CP0] --> CompValid
    
    CompValid --> LaborMatch[Labor Time Master Matching]
    LaborMaster[Labor Time Master - PROD1.GX4LH0] --> LaborMatch
    
    LaborMatch --> JudgmentCalc[Judgment Calculation]
    JudgmentCalc --> StoreJudgment[Store to TAPEG.G420.EZ3X-E]
    
    StoreJudgment --> VSAMReorg[VSAM Reorganization - @G422E8]
    VSAMReorg --> LoadVSAM[Load to PROD1.GX4EZE]
    LoadVSAM --> BuildIndex[Build Alternate Index - PROD1.GY4EZE]
    BuildIndex --> OnlineAccess[Online Access via PROD1.GZ4EZE]
    
    StoreJudgment --> FTPGen[FTP Data Generation - G422E01C]
    FTPGen --> DealerFTP[Dealer FTP - PRODA.G420E00.HANTEIDB]
    
    StoreJudgment --> UnmatchExtract[Vehicle History Unmatch Extraction]
    UnmatchExtract --> UnmatchFTP[Unmatch FTP - PRODA.G420E00.VHERR]
    
    Store1 --> TapeBackup[Tape Backup]
    StorePending --> TapeBackup
    StoreReapp1 --> TapeBackup
    StoreReapp2 --> TapeBackup
```

```
graph TB
    OrderParam[Order Parameter Library - PRODA.G470C00.LIB] --> Extract[G472B50C - Order Parameter Extraction]
    
    TG4G50_Init[Recall Target DB Initial - DB2G.TG4G50] --> Baseline[G472B01_Step1 - Baseline Unload]
    
    Extract --> OrderUnload[G472B01_Step2 - Order Master Unload]
    OrderMaster[Order Master DB - DB2G.TG4G67] --> OrderUnload
    
    OrderUnload --> Insert[G472B51C - Target DB Insertion]
    Insert --> TG4G50_Updated[Recall Target DB Updated - DB2G.TG4G50]
    
    TG4G50_Updated --> UpdatedUnload[G472B01_Step3 - Updated DB Unload]
    UpdatedUnload --> LogisticsDist[G472B01_Step4 - Logistics Distribution]
    UpdatedUnload --> FINDDist[G472B01_Step5 - FIND Incremental Distribution]
    
    LogisticsDist --> LogisticsSystem[Logistics System - PRODA.D200R00.TG4G50]
    FINDDist --> FINDSystem[FIND System - PRODA.G470B00.FINDG50]
    
    UserData[User-Provided Target Vehicles - TESTT.G401R00.XXXX] --> Sort1[G472C01_Step1 - Sort by VIN]
    Sort1 --> Match[G472C01_Step2 - Vehicle History Matching]
    VehicleHistory[Vehicle History DB - TESTT.G479VHX1.XXXX] --> Match
    
    Match --> MatchedOutput[G472C01_Step3 - Matched Vehicle Output]
    Match --> UnmatchedOutput[G472C01_Step4 - Unmatched Vehicle Extraction]
    
    MatchedOutput --> MatchedDataset[Matched Vehicles - TESTA.G470VHD.ODRXXXX]
    UnmatchedOutput --> UnmatchedDataset[Unmatched Vehicles - TESTA.G470VHD.ODRXXXXU]
    
    OrderDetailParam[Order Detail Parameters - PRODA.G470C00.LIB] --> DetailExtract[G472E10_Step1 - Order Detail Extraction]
    DetailExtract --> DetailUnload[G472E10_Step2 - Order Detail Format Unload]
    OrderDetailDB[Order Detail DB - DB2G.TG4G68] --> DetailUnload
    
    DetailUnload --> LayoutConv[G472E10_Step3 - Layout Conversion]
    LayoutConv --> OwnershipExtract[G472C12C - Vehicle Ownership Extraction]
    OwnershipTape[Vehicle Ownership Tape - TAPEG.G470D00.JB01] --> OwnershipExtract
    
    OwnershipExtract --> MinistryRecord[G472E10_Step4 - Ministry Record Creation]
    MinistryRecord --> MinistrySort[G472E10_Step5 - Ministry Record Sorting]
    
    MinistrySort --> TransportNum[G472E21C - Transport Number Assignment]
    TargetOrderDB[Target Order DB - DB2G.TG4G66] --> TransportNum
    
    TransportNum --> SettingClass[G472E22C - Setting Classification Assignment]
    OwnerMaster[Owner Master - PRODA.E200A09.RKJMEMST] --> SettingClass
    
    SettingClass --> MinistrySubmission[Ministry Submission Files - External]
    
    DateMaster[Date Master - PROD1.GX4F80] --> CampaignSelect[G401N01C - Campaign Vehicle Selection]
    VehicleHistoryTape[Vehicle History Tape - TAPEG.G401E44.VINDOM] --> CampaignSelect
    
    CampaignSelect --> CampaignFilter[G472S2D_Step1 - Campaign Order Filtering]
    CampaignFilter --> CampaignSort[G472S2D_Step2 - Campaign Vehicle Sorting]
    CampaignSort --> ClaimRef[Claim Judgment Reference - PRODT.G401F40.TRN1]
    
    RecallData[Recall Implementation Data - TAPEG.G470C10.R1D-T2] --> StatusReport[G472C01C - Status Report Generation]
    OrderMasterFile[Order Master - PRODA.G470C20.ODR] --> StatusReport
    StatusReport --> EmailNotif[Email Notification - PRODT.G470C00.PCDATA]
```

```
graph TB
    LaborTrans[PRODT.G410LHT.S01 - Labor Transactions] --> LaborValidation[G412L01C - Labor Validation]
    NissanTrans[PRODT.G410LNT.S01 - Nissan Conversion Transactions] --> LaborValidation
    ComponentTrans[PRODT.G410CPT.S01 - Component Transactions] --> ComponentValidation[G412C01C - Component Validation]
    
    ComponentValidation --> DealerMaster[PRODA.G410ZZ0.ZZ0 - Dealer Master]
    LaborValidation --> DealerMaster
    LaborValidation --> ComponentMaster[PRODA.G410CP0.CP0 - Component Master]
    LaborValidation --> ReferenceMaster[PRODA.G410RI0.RI0 - Reference Master]
    
    ComponentValidation --> ComponentUpdate[G412C02C - Component Master Update]
    ComponentUpdate --> ComponentMaster
    ComponentUpdate --> ComponentReport[G412C01E - Component Change Report]
    
    LaborValidation --> LaborUpdate[G412L02C - Labor Master Update]
    LaborUpdate --> LaborVerify[G412L03C - Labor Verification]
    LaborVerify --> VSAMReorg[IDCAMS - VSAM Reorganization]
    VSAMReorg --> LaborMasterVSAM[PROD1.GX4LH0 - Labor Master]
    
    LaborMasterVSAM --> ConversionExtract[G412L11C - Conversion Data Extract]
    ConversionExtract --> ConversionValidation[G412L12C - Conversion Validation]
    ConversionValidation --> ComponentMaster
    ConversionValidation --> DealerMaster
    ConversionValidation --> ConversionBuild[G412L13C - Conversion Master Build]
    ConversionBuild --> ConversionUpdate[G412L14C - Conversion Master Update]
    ConversionUpdate --> ConversionMasterVSAM[PROD1.GX4LN0 - Conversion Master]
    
    LaborUpdate --> LaborReport[G412L07C - Labor Change Report]
    
    LaborMasterVSAM --> ClaimJudgment[G401M/G422 - Claim Judgment Systems]
    ConversionMasterVSAM --> OverseasClaim[G422 - Overseas Claim Processing]
    ComponentMaster --> ClaimJudgment
    
    LaborReport --> AuditTrail[Audit Trail and Review]
    ComponentReport --> AuditTrail
    
    LaborUpdate --> MaintenanceLog[PRODA.G410LOG.LOG - Maintenance Log]
    ComponentUpdate --> MaintenanceLog
    ConversionUpdate --> MaintenanceLog
```

```
graph TB
    OnlineUsage[Online System Usage - QUICS3] --> RequestStats[Request Statistics Collection - TG4J12]
    HistoricalBackup[Historical Backup - PRODG.G401J65.BKUP] --> Merge[Data Merge and Filtering - @G401J00]
    RequestStats --> Merge
    
    Merge --> StatusFilter[Status Filtering - Exclude 01,02,10,11,30,40]
    StatusFilter --> DateFilter[6-Month Rolling Window Filter]
    DateFilter --> Aggregation[Summarization by Keys - EASY]
    
    Aggregation --> FTPOutput[FTP Distribution File - PRODT.G440QR06.FTP]
    Aggregation --> BackupUpdate[Historical Backup Update - PRODG.G401J65.BKUP]
    
    OnlineScreens[Online Screens 103C, 219C] --> ScreenClose[Screen Closure - G401D05C]
    VSAMFiles[VSAM Files GX41D1, GX41J1] --> VSAMClose[VSAM Closure - CICS7MOD]
    
    ScreenClose --> DBExtract[Database Extraction - @G401J10]
    VSAMClose --> DBExtract
    
    TG4D06[TG4D06 Database Structure Table] --> DBExtract
    TG4D05[TG4D05 Item Database Table] --> DBExtract
    
    DBExtract --> StructureFile[PRODT.G401D02 Structure Extract]
    DBExtract --> ItemFile[PRODT.G401D06 Item Extract]
    
    StructureFile --> StatProcessing[Statistical Processing - G401J15C]
    ItemFile --> StatProcessing
    FTPOutput --> StatProcessing
    
    StatProcessing --> QualityReports[Quality Management Reports]
    StatProcessing --> BIAnalysis[Business Intelligence Analysis]
    StatProcessing --> PerfMonitoring[Performance Monitoring]
```

```
graph TB
    JudgmentDomestic[Domestic Judgment Results - TAPEG.G420.EZ3T-E] --> Extract1[G432A51_Step1 - Judgment Result Extraction]
    JudgmentOverseas[Overseas Judgment Results - TAPEG.G420.EZ3S-E] --> Extract1
    
    Extract1 --> AmountCalc[G432A51_Step2 - Amount Calculation]
    AmountCalc --> |Submitted = AAMNT + DAMNT| Aggregate1[G432A51_Step3 - Aggregate by Destination]
    AmountCalc --> |Approved = AAMNT| Aggregate1
    AmountCalc --> |Claim = CAMNTL + CAMNTP| Aggregate1
    
    Aggregate1 --> Sort1[G432A51_Step4 - Sort by Destination/Items]
    Sort1 --> Summarize1[G432A51_Step5 - SUMMARIZE Aggregation]
    
    AcctMaster[Accounting Master VSAM - PROD1.GX4A01] --> Match1[G432A26C - Accounting Master Matching]
    DateMaster[Date Master - PRODA.G410ZZ0.ZZ0] --> Match1
    Summarize1 --> Match1
    
    Match1 --> Export1[G432A51_Step6 - Export File Generation]
    Export1 --> AcctExport1[Overseas Service Export - PRODA.G430A01.EXP]
    
    JudgmentDomestic --> Extract2[G432A52_Step1 - Detail Data Extraction]
    Extract2 --> Transform[G432A28C - Detail Data Transformation]
    Transform --> Aggregate2[G432A52_Step2 - Aggregate by Item Key]
    Aggregate2 --> Match2[G432A29C - Detail Accounting Master Matching]
    AcctMaster --> Match2
    Match2 --> AcctExport2[Detail Export - PRODA.G430A02.EXP]
    
    JudgmentDomestic --> Extract3[G432A53_Step1 - Judgment Result with Claim Type]
    JudgmentOverseas --> Extract3
    Extract3 --> AmountCalc2[G432A53_Step2 - Amount Calculation with CLMTYP]
    AmountCalc2 --> Aggregate3[G432A53_Step3 - Aggregate Labor Claims]
    
    RecoveryData[Recovery Amount Data - TAPEG.G430B00.AZ1B-E1/E4] --> RecoveryProc[G432A53_Step4 - Recovery Amount Processing]
    RecoveryProc --> |Separate Parts/Labor| Aggregate3
    
    DistMaster[Distributor Master - PRODA.G410DD0.DD0] --> DistMatch[G432A53_Step5 - Distributor Master Matching]
    Aggregate3 --> DistMatch
    
    DistMatch --> Match3[G432A53_Step6 - Accounting Master Matching]
    AcctMaster --> Match3
    Match3 --> Export3[G432A53_Step7 - Final Export File Generation]
    
    Export3 --> FASTFile[FAST Accounting Connection - PRODG.G430B01.G]
    
    AcctExport1 --> AcctSystem[Corporate Accounting System - External]
    AcctExport2 --> AcctSystem
    FASTFile --> AcctSystem
```

```
graph TB
    subgraph External_Inbound[External Inbound Interfaces]
        ClaimInput[Claim Submissions<br/>Dealers & Service Centers]
        DesignInput[Design Data<br/>Engineering Systems]
        RecallInput[Recall Data<br/>Quality Systems]
        FALCONInput[FALCON System<br/>External Integration]
        TapeInput[Tape Storage<br/>Historical Data]
    end
    
    subgraph Core_System[Vehicle Warranty Claim Management System - G401]
        subgraph Claim_Processing[Claim Processing Domain]
            G401M[Domestic Claim Judgment - G401M]
            G422[Overseas Claim Judgment - G422]
            G401A[Claim Recovery - G401A]
            G401B[Indemnity Judgment - G401B]
        end
        
        subgraph Master_Data[Master Data Domain]
            G412[Master Data Maintenance - G412]
            G401E[Vehicle Information Management - G401E]
        end
        
        subgraph Financial[Financial Domain]
            G432[Accounting Connection - G432]
            G482[Overseas Billing - G482]
        end
        
        subgraph Analytics[Analytics & Reporting Domain]
            G401J[Quality Statistics - G401J]
            G401H[Statistical Distribution - G401H]
        end
        
        subgraph Integration[Integration Domain]
            G401F[FALCON Integration - G401F]
            G401C[Bulletin Management - G401C]
            G462[Dealer Info Distribution - G462]
        end
        
        subgraph Operations[Operations Domain]
            G472[Recall Follow-up - G472]
            G401D[Common Processing - G401D]
        end
        
        subgraph Data_Storage[Data Storage Layer]
            DB2[DB2 Database<br/>TG4E: Vehicle Specs<br/>TG4F: FALCON Data<br/>TG4G: Master Data<br/>TG4A: Claim Recovery<br/>TG4P: Claim Data]
            VSAM[VSAM Files<br/>Master & Transaction Data]
        end
    end
    
    subgraph External_Outbound[External Outbound Interfaces]
        AccountingOut[Accounting System<br/>Payment Instructions]
        CognosOut[Cognos BI<br/>Statistical Reports]
        EmailOut[Email Server<br/>Notifications]
        TapeOut[Tape Storage<br/>Archival & Backup]
        DealerOut[Dealer Systems<br/>Information Distribution]
    end
    
    ClaimInput --> G401M
    ClaimInput --> G422
    DesignInput --> G401E
    RecallInput --> G472
    FALCONInput --> G401F
    TapeInput --> G401D
    
    G401M --> G401A
    G401M --> G401B
    G422 --> G401B
    
    G412 --> G401M
    G412 --> G422
    G401E --> G401M
    G401E --> G422
    
    G401A --> G432
    G401B --> G432
    G482 --> G432
    
    G401M --> G401J
    G422 --> G401J
    G401J --> G401H
    
    G401M --> G401F
    
    G401M --> DB2
    G422 --> DB2
    G412 --> DB2
    G401E --> DB2
    G401A --> VSAM
    
    G432 --> AccountingOut
    G401H --> CognosOut
    G472 --> EmailOut
    G401D --> TapeOut
    G401C --> DealerOut
    G462 --> DealerOut
    G401F --> FALCONInput
```

```
graph TB
    ClaimSubmit[Claim Submission - External] --> G401M[Domestic Claim Judgment - G401M]
    OverseasClaim[Overseas Claim - External] --> G422[Overseas Claim Judgment - G422]
    
    G401M --> G401A[Claim Recovery Calculation - G401A]
    G401M --> G401B[Indemnity Judgment - G401B]
    G422 --> G401B
    
    G401A --> G432[Accounting Connection - G432]
    G401B --> G432
    G432 --> Payment[Payment to Dealers - External]
    
    DesignData[Design Data - External] --> G401E[Vehicle Information Management - G401E]
    G401E --> G401M
    G401E --> G422
    
    G412[Master Data Maintenance - G412] --> G401M
    G412 --> G422
    G412 --> G401E
    
    G401M --> G401J[Quality Statistics - G401J]
    G422 --> G401J
    G401J --> G401H[Statistical Distribution - G401H]
    G401H --> Cognos[Cognos BI - External]
    
    RecallData[Recall Data - External] --> G472[Recall Follow-up - G472]
    G472 --> EmailNotif[Email Notifications - External]
    
    G401F[FALCON Integration - G401F] --> FALCON[FALCON System - External]
    G401M --> G401F
    
    G401C[Bulletin Management - G401C] --> DealerInfo[Dealer Information - External]
    G462[Dealer Info Distribution - G462] --> DealerInfo
    
    G482[Overseas Billing - G482] --> G432
    
    G401D[Common Processing - G401D] --> Backup[Tape Backup - External]
    G401E --> Backup
```

```
graph TB
    User[Business Users] --> Online[Online Screens - G401D05C]
    User --> Reports[Report Generation - EASYGO]
    
    Batch[Batch Processing - @G401E21] --> SpecDB[Specification Database Management]
    Batch --> Backup[Database Backup]
    
    SpecDB --> DB2[(DB2 Database<br/>TG4E01-TG4E06)]
    
    Online --> DB2
    
    Parts[Parts & Inventory - G101] --> DB2
    DomesticSales[Domestic Sales - G201] --> DB2
    ExportSales[Export Sales - G301] --> DB2
    VehicleMaster[Vehicle Master - G410] --> DB2
    Classification[Vehicle Classification - G420] --> DB2
    Financial[Financial Processing - G430] --> DB2
    Claims[Claim Management - G440] --> DB2
    Operations[Vehicle Operations - G460] --> DB2
    Recall[Recall Management - G470] --> DB2
    Payment[Payment Reconciliation - G472] --> DB2
    SpecMaint[Specification Maintenance - G402] --> DB2
    
    DB2 --> VSAM[VSAM Files<br/>PROD1.GX4E21]
    DB2 --> Sequential[Sequential Files]
    DB2 --> Tape[Tape Storage - TAPEG]
    
    DesignFiles[Design Info Files<br/>K701BM2/BM3] --> Batch
    
    Reports --> Sequential
    Reports --> Output[Report Output]
```

```
graph TB
    FTP[FTP Server - External] -->|CSV Files| SYS[Claim Processing System]
    WOS[WOS System - External] -->|Line Claim CSV| SYS
    SYS -->|Validated Claims| DB[(DB2 Database - TG4A11)]
    SYS -->|Success Files| EMAIL[Email System - External]
    SYS -->|Error Reports| EMAIL
    DB_MASTER[(Master Data - DB2)]-->|Lookup| SYS
    VSAM[(VSAM Files - Master)]-->|Lookup| SYS
    LABOR[(Labor Rate File - G402B66)]-->|Lookup| SYS
    
    subgraph Master Data Sources
        DB_MASTER
        VSAM
        LABOR
    end
    
    subgraph External Interfaces
        FTP
        WOS
        EMAIL
        DB
    end
```

```
graph TB
    subgraph External_Interfaces[External Interfaces]
        Users[Business Users]
        DesignSys[Design Information System - K701BM2/BM3]
        ExtSys[External Systems]
    end
    
    subgraph Presentation_Layer[Presentation Layer]
        OnlineScreens[Online Screens<br/>CICS Transactions]
        BatchJobs[Batch Jobs - JCL]
        Reports[Report Generation - EASYGO]
    end
    
    subgraph Application_Layer[Application Layer]
        CobolPgm[COBOL Programs<br/>G401E21C-G401E25C]
        Utilities[Utilities<br/>DB2BATCH, SORTD, FASTCOPY]
    end
    
    subgraph Data_Layer[Data Layer]
        DB2[(DB2 Database<br/>DB2G Schema<br/>Tables: TG4E01-TG4E06)]
        VSAM[(VSAM Files<br/>PROD1.GX4E21)]
        Sequential[(Sequential Files)]
        Tape[(Tape Storage<br/>TAPEG)]
    end
    
    Users --> OnlineScreens
    Users --> BatchJobs
    Users --> Reports
    
    DesignSys --> BatchJobs
    
    OnlineScreens --> CobolPgm
    BatchJobs --> CobolPgm
    Reports --> Utilities
    
    CobolPgm --> DB2
    CobolPgm --> VSAM
    CobolPgm --> Sequential
    
    Utilities --> DB2
    Utilities --> Sequential
    
    DB2 --> Tape
    Sequential --> Tape
    
    DB2 --> ExtSys
    Sequential --> ExtSys
```

```
graph TB
    subgraph Input Layer
        FTP_IN[FTP Inbound Files]
        CSV_MANUAL[Manual Claim CSV - G402B51.CSV1]
        CSV_LINE[Line Claim CSV - G402B61.CSV]
    end
    
    subgraph Processing Layer - Manual Claims
        SORT1[Header Removal - SORTD]
        CONV1[CSV to Fixed - CSVCNV1]
        PROG1[Validation Program - G402B51C]
        CONV2[Fixed to CSV - CSVCNV1]
        HEAD1[Header Addition - U00405A]
    end
    
    subgraph Processing Layer - Line Claims
        SORT2[Header Removal - SORTD]
        CONV3[CSV to Fixed - CSVCNV1]
        PROG2[Cost Calculation Program - G402B61C]
        SORT3[Output Sorting - SORTD]
        CONV4[Fixed to CSV - CSVCNV1]
        HEAD2[Header Addition - U00405A]
        CONV5[Error to CSV - CSVCNV1]
        HEAD3[Error Header Addition - U00405A]
    end
    
    subgraph Data Access Layer
        VSAM_A00[Vendor Master - GX4A01]
        VSAM_B12[Currency Master - GX4B12]
        DB2_A04[Security Master - TG4A04]
        DB2_A05[Processing Cost Master - TG4A05]
        DB2_A06[Parts Price Master - TG4A06]
        DB2_A11[Claim Data Table - TG4A11]
        FILE_B66[Labor Rate Master - G402B66.NINK]
    end
    
    subgraph Output Layer
        OUT_B51[Validated Claims - G402B51.DAY1]
        OUT_B52[Manual Errors - G402B52.ERR1]
        OUT_B62[Line Claims - G402B62.OUT]
        OUT_B64[Line Errors - G402B64.ERR]
        EMAIL_OUT[Email Notification]
        BACKUP[Backup Storage - 5 Gen]
    end
    
    FTP_IN --> CSV_MANUAL
    FTP_IN --> CSV_LINE
    
    CSV_MANUAL --> SORT1 --> CONV1 --> PROG1
    PROG1 --> OUT_B51
    PROG1 --> CONV2 --> HEAD1 --> OUT_B52
    
    CSV_LINE --> SORT2 --> CONV3 --> PROG2
    PROG2 --> SORT3 --> CONV4 --> HEAD2 --> OUT_B62
    PROG2 --> CONV5 --> HEAD3 --> OUT_B64
    
    VSAM_A00 -.->|Read| PROG1
    VSAM_B12 -.->|Read| PROG1
    DB2_A04 -.->|Read| PROG2
    DB2_A05 -.->|Read| PROG2
    DB2_A06 -.->|Read| PROG2
    FILE_B66 -.->|Read| PROG2
    
    OUT_B51 --> DB2_A11
    OUT_B52 --> EMAIL_OUT
    OUT_B62 --> EMAIL_OUT
    OUT_B64 --> EMAIL_OUT
    CSV_LINE --> BACKUP
```

```
flowchart TD
    subgraph Creation
        A[Create generation task] -->|Open dialog| B[Fill input]
        B --> C{Parameter Type}
        C -->|Free text| D[Free text input]
        C -->|Dropdown| E[Select option]
        D --> F[Input Parameters]
        E --> F
        F --> G[Submit Task]
        G --> |Create Task| H[Task]
        H --> I((Cancel Task))
    end

    subgraph Execution
        H --> J[Run Task]
        J --> O[Agent]
        O --> K[Task result]
    end

    subgraph Validation
        K --> L[User Review]
        L --> |OK| M((Final Output))
        L --> |Not OK| N[Feedback]
        N --> H
    end
```

```
classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
      +String beakColor
      +swim()
      +quack()
    }
    class Fish{
      -int sizeInFeet
      -canEat()
    }
    class Zebra{
      +bool is_wild
      +run()
    }
```