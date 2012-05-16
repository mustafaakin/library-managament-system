CREATE VIEW UserConstraints AS
SELECT CT.name, U.UserID, value FROM UserTable UT, User U, Constraints C, ConstraintTable CT
WHERE UT.type = U.type AND C.usertype = U.type AND CT.type = C.usertype;

CREATE VIEW BorrowCheck AS 
SELECT B.UserID, B.ItemID, B.BorrowDate,
DATE_ADD(B.BorrowDate, INTERVAL (UC.value * (B.ExtensionCount+1)) DAY) AS ValidUntil, 
DATE_ADD(B.BorrowDate, INTERVAL (UC.value * (B.ExtensionCount+1)) DAY) < CURDATE() As IsPassed,
UC2.value < B.ExtensionCount AS MaxExtensionBreached
FROM Borrow B, UserConstraints UC, UserConstraints UC2
WHERE B.UserID = UC.UserID AND UC.UserID = UC2.UserID
AND UC.name = "TakeawayDays";

CREATE VIEW UserHoldings AS
SELECT I.ItemID, I.Title, B.BorrowDate, BC.ValidUntil, BC.IsPassed, B.UserID, BC.MaxExtensionBreached
FROM Item I, Borrow B , BorrowCheck BC
WHERE I.ItemID = B.ItemID 
AND B.ItemID = BC.ItemID
AND B.UserID = BC.UserID;

CREATE VIEW LateCheckouts AS 
SELECT (DATEDIFF(ValidUntil, BorrowDate) * IsPassed * value) AS Price, BC.UserID, BC.ItemID
FROM BorrowCheck BC, UserConstraints UC
WHERE BC.UserID = UC.UserID AND UC.name = "DelayDue";

CREATE VIEW LoginCheck AS 
SELECT U.name AS Username, MH.UserID AS UserID, (MAX(ExpireDate) > CURDATE() OR U.type = 1) AS IsExpired, U.email, U.Password, UT.name AS UserType
FROM MembershipHistory MH, User U, UserTable UT
WHERE U.UserID = MH.UserID AND UT.type = U.type
GROUP BY MH.UserID;

CREATE VIEW StaffStatitsics AS
SELECT StaffID, COUNT(date) AS count, SUM(amount) AS money, DateOfBirth, U.name, U.email FROM User U, Returns R
WHERE R.StaffID = U.UserID
GROUP BY StaffID;

CREATE VIEW BorrowDetails AS
SELECT UC.UserID, I.ItemID, I.Title, BorrowDate, ValidUntil, IsPassed, UC.Value AS MaxExtensions FROM BorrowCheck BC, Item I, UserConstraints UC
WHERE BC.ItemID = I.ItemID AND UC.UserID = BC.UserID AND UC.name = "MaxExtensions";

CREATE VIEW UserTypeConstraints AS
SELECT CT.type , CT.name, CT.explanation, C.userType, C.value, UT.name AS user FROM Constraints C, ConstraintTable CT, UserTable UT
WHERE C.constraintType = CT.type AND UT.type = C.userType;

CREATE VIEW ReserveQueue AS
SELECT 
	UC.UserID, ItemID, putTime, 
	CURRENT_TIMESTAMP < DATE_ADD(putTime, INTERVAL value DAY) AS StillValid, 
	DATE_ADD(putTime, INTERVAL value DAY) AS ValidUntil 
FROM UserConstraints UC, Reserve R
WHERE UC.name ="ReservePeriod" AND R.UserID = UC.UserID AND isTaken = 0
ORDER BY putTime ASC;
