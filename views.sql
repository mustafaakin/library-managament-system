SELECT B.UserID, B.ItemID, B.BorrowDate
DATE_ADD(B.BorrowDate, INTERVAL (UC.value * (B.ExtensionCount+1)) DAY) AS ValidUntil, 
DATE_ADD(B.BorrowDate, INTERVAL (UC.value * (B.ExtensionCount+1)) DAY) < CURDATE() As IsPassed,
UC2.value < B.ExtensionCount AS MaxExtensionBreached
FROM Borrow B, UserConstraints UC, UserConstraints UC2
WHERE B.UserID = UC.UserID AND UC.UserID = UC2.UserID
AND UC.name = "TakeawayDays"

SELECT I.ItemID, I.Title, B.BorrowDate, BC.ValidUntil, BC.IsPassed, B.UserID, BC.MaxExtensionBreached
FROM Item I, Borrow B , BorrowCheck BC
WHERE I.ItemID = B.ItemID 
AND B.ItemID = BC.ItemID
AND B.UserID = BC.UserID


CREATE VIEW LateCheckouts AS 
SELECT (DATEDIFF(ValidUntil, BorrowDate) * IsPassed * value) AS Price, BC.UserID, BC.ItemID
FROM BorrowCheck BC, UserConstraints UC
WHERE BC.UserID = UC.UserID AND UC.name = "DelayDue"

CREATE VIEW LoginCheck AS 
SELECT MH.UserID AS UserID, MAX(ExpireDate) > CURDATE() AS IsExpired, U.email, U.Password, UT.name AS UserType
FROM MembershipHistory MH, User U, UserTable UT
WHERE U.UserID = MH.UserID AND UT.type = U.type
GROUP BY MH.UserID

CREATE VIEW StaffStatitsics AS
SELECT StaffID, COUNT(date) AS count, SUM(amount) AS money, DateOfBirth, U.name, U.email FROM User U, Returns R
WHERE R.StaffID = U.UserID
GROUP BY StaffID