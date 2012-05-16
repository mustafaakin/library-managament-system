-- phpMyAdmin SQL Dump
-- version 3.5.0
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: May 11, 2012 at 05:13 AM
-- Server version: 5.5.22-0ubuntu1
-- PHP Version: 5.3.10-1ubuntu3.1

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `library`
--
CREATE DATABASE `library` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `library`;

-- --------------------------------------------------------

--
-- Table structure for table `Audio`
--

CREATE TABLE IF NOT EXISTS `Audio` (
  `ItemID` int(11) NOT NULL DEFAULT '0',
  `ProductionYear` int(4) DEFAULT NULL,
  `Artist` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ItemID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `Audio`
--

INSERT INTO `Audio` (`ItemID`, `ProductionYear`, `Artist`) VALUES
(6, 2002, 'Eminem'),
(7, 2002, 'Eminem'),
(8, 2011, 'Jessie J'),
(9, 2011, 'Jessie J');

-- --------------------------------------------------------

--
-- Table structure for table `Book`
--

CREATE TABLE IF NOT EXISTS `Book` (
  `ItemID` int(11) NOT NULL DEFAULT '0',
  `ISBN` text,
  `Author` text,
  `Publisher` text,
  `PublicationYear` int(4) DEFAULT NULL,
  PRIMARY KEY (`ItemID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `Book`
--

INSERT INTO `Book` (`ItemID`, `ISBN`, `Author`, `Publisher`, `PublicationYear`) VALUES
(1, '1-1235-633421', 'Ramakrhisnan-Gerke', 'McGraw Hill', 1950),
(2, '1-389128-4123', 'Silberschatz, Galvin, Gagne', 'Wiley', 1994),
(13, '5-1230', 'EEciler', 'EEE Bolumu', 1987),
(16, '9-388-321-55123', 'Cormen, Leiserson, R?vest, Stein', 'Hi', 2003);

-- --------------------------------------------------------

--
-- Table structure for table `Borrow`
--

CREATE TABLE IF NOT EXISTS `Borrow` (
  `ItemID` int(11) NOT NULL DEFAULT '0',
  `UserID` int(11) NOT NULL DEFAULT '0',
  `BorrowDate` date NOT NULL DEFAULT '0000-00-00',
  `ExtensionCount` int(3) DEFAULT NULL,
  PRIMARY KEY (`ItemID`,`UserID`,`BorrowDate`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `Borrow`
--

INSERT INTO `Borrow` (`ItemID`, `UserID`, `BorrowDate`, `ExtensionCount`) VALUES
(9, 9, '2012-05-04', 13);

-- --------------------------------------------------------

--
-- Stand-in structure for view `BorrowCheck`
--
CREATE TABLE IF NOT EXISTS `BorrowCheck` (
`UserID` int(11)
,`ItemID` int(11)
,`BorrowDate` date
,`ValidUntil` date
,`IsPassed` int(1)
,`MaxExtensionBreached` int(1)
);
-- --------------------------------------------------------

--
-- Table structure for table `CommentAndRate`
--

CREATE TABLE IF NOT EXISTS `CommentAndRate` (
  `userID` int(11) NOT NULL DEFAULT '0',
  `itemID` int(11) NOT NULL DEFAULT '0',
  `message` text,
  `rating` int(1) DEFAULT NULL,
  `date` date DEFAULT NULL,
  PRIMARY KEY (`itemID`,`userID`),
  KEY `userID` (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `CommentAndRate`
--

INSERT INTO `CommentAndRate` (`userID`, `itemID`, `message`, `rating`, `date`) VALUES
(9, 1, 'database güzeldir herkes bilmeli', 1, '2012-05-11'),
(9, 2, 'cool book', 1, '2012-05-11'),
(9, 5, 'vedat sedat civat nihat', 4, '2012-05-11'),
(9, 9, 'jessie j sings well', 3, '2012-05-11'),
(9, 16, 'aq', 1, '2012-05-11'),
(11, 16, 'I learned good algorithms', 5, '2012-05-11');

-- --------------------------------------------------------

--
-- Table structure for table `ConstraintTable`
--

CREATE TABLE IF NOT EXISTS `ConstraintTable` (
  `type` int(5) NOT NULL DEFAULT '0',
  `name` varchar(255) DEFAULT NULL,
  `explanation` text NOT NULL,
  PRIMARY KEY (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `ConstraintTable`
--

INSERT INTO `ConstraintTable` (`type`, `name`, `explanation`) VALUES
(1, 'MembershipPeriod', 'How many days for user membership is allowed?'),
(2, 'MembershipDue', 'How much does membership cost?'),
(3, 'MaxBorrowCount', 'How many borrowable items that a user can take away?'),
(4, 'DelayDue', 'How much does delaying will cost?'),
(5, 'MaxExtensions', 'How many times a user can extend items?'),
(6, 'TakeawayDays', 'How many days for user can take away the item?'),
(7, 'ReservePeriod', 'How many days the reserving an item will be valid?'),
(8, 'MaxRoomDuration', 'How many days for user can reserve a special room?');

-- --------------------------------------------------------

--
-- Table structure for table `Constraints`
--

CREATE TABLE IF NOT EXISTS `Constraints` (
  `constraintType` int(5) NOT NULL DEFAULT '0',
  `userType` int(2) NOT NULL DEFAULT '0',
  `value` int(11) DEFAULT NULL,
  PRIMARY KEY (`constraintType`,`userType`),
  KEY `userType` (`userType`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `Constraints`
--

INSERT INTO `Constraints` (`constraintType`, `userType`, `value`) VALUES
(1, 2, 50),
(1, 3, 365),
(1, 4, 5),
(1, 5, 1),
(2, 2, 0),
(2, 3, 25),
(2, 4, 5),
(2, 5, 3),
(3, 3, 20),
(3, 4, 5),
(3, 5, 2),
(4, 3, 5),
(4, 4, 5),
(4, 5, 10),
(5, 3, 10),
(5, 4, 4),
(5, 5, 0),
(6, 3, 60),
(6, 4, 14),
(6, 5, 1),
(7, 3, 5),
(7, 4, 3),
(7, 5, 1),
(8, 3, 360),
(8, 4, 180),
(8, 5, 120);

-- --------------------------------------------------------

--
-- Table structure for table `EMaterial`
--

CREATE TABLE IF NOT EXISTS `EMaterial` (
  `ItemID` int(10) NOT NULL DEFAULT '0',
  `URL` text,
  PRIMARY KEY (`ItemID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `EMaterial`
--

INSERT INTO `EMaterial` (`ItemID`, `URL`) VALUES
(10, 'www.chip.com.tr'),
(11, 'www.hurriyet.com.tr'),
(12, 'www.hackerne.ws');

-- --------------------------------------------------------

--
-- Table structure for table `Item`
--

CREATE TABLE IF NOT EXISTS `Item` (
  `ItemID` int(11) NOT NULL AUTO_INCREMENT,
  `Borrowable` tinyint(1) DEFAULT NULL,
  `Location` varchar(255) DEFAULT NULL,
  `Title` varchar(255) DEFAULT NULL,
  `count` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ItemID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=17 ;

--
-- Dumping data for table `Item`
--

INSERT INTO `Item` (`ItemID`, `Borrowable`, `Location`, `Title`, `count`) VALUES
(1, 1, '78.yurt 59.oda', 'Database Management Systems', 1),
(2, 1, '78.yurt 59.oda', 'Operating Sytems Concepts', 5),
(3, 1, 'Media Room', 'Star Wars Episode III - Revenge of the Sith', 1),
(4, 1, 'Media Room', 'Star Wars Episode II - Attack of the Clones', 1),
(5, 1, 'Media Room', 'Star Wars Episode I - Phantom Menace', 1),
(6, 1, 'Audio Stack, AG-345', '8 Mile', 1),
(7, 1, 'Audio Stack, AG-345', '8 Mile', 1),
(8, 1, 'Audio Stack, CD-359', 'Who You Are', 1),
(9, 1, 'Audio Stack, CD-359', 'Who You Are', 1),
(10, 0, '', 'CHIP Online', 0),
(11, 0, '', 'Hurriyet', 0),
(12, 0, '', 'Hacker News', 0),
(13, 1, 'CK - 783', 'Signal Processing First', 50),
(16, 1, 'TK - 421', 'Introduction to Algorithms', 5);

-- --------------------------------------------------------

--
-- Stand-in structure for view `LateCheckouts`
--
CREATE TABLE IF NOT EXISTS `LateCheckouts` (
`Price` bigint(27)
,`UserID` int(11)
,`ItemID` int(11)
);
-- --------------------------------------------------------

--
-- Stand-in structure for view `LoginCheck`
--
CREATE TABLE IF NOT EXISTS `LoginCheck` (
`Username` varchar(255)
,`UserID` int(11)
,`IsExpired` int(1)
,`email` text
,`Password` varchar(32)
,`UserType` varchar(255)
);
-- --------------------------------------------------------

--
-- Table structure for table `MembershipHistory`
--

CREATE TABLE IF NOT EXISTS `MembershipHistory` (
  `UserID` int(11) DEFAULT NULL,
  `Charge` double DEFAULT NULL,
  `StartDate` date DEFAULT NULL,
  `ExpireDate` date DEFAULT NULL,
  KEY `UserID` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `MembershipHistory`
--

INSERT INTO `MembershipHistory` (`UserID`, `Charge`, `StartDate`, `ExpireDate`) VALUES
(1, 0, '2012-10-04', '2013-10-14'),
(2, 0, '2012-10-04', '2013-10-14'),
(3, 0, '2012-10-04', '2013-10-14'),
(4, 0, '2012-10-04', '2013-10-14'),
(9, NULL, '2012-05-04', '2013-05-04'),
(10, 1, '2012-05-04', '2012-05-05'),
(3, 15, '2012-10-04', '2011-10-14'),
(11, 5, '2012-05-04', '2012-06-03'),
(9, 25, '2012-05-08', '2013-05-08'),
(10, 3, '2012-05-08', '2012-05-09');

-- --------------------------------------------------------

--
-- Table structure for table `Reserve`
--

CREATE TABLE IF NOT EXISTS `Reserve` (
  `ItemID` int(11) NOT NULL DEFAULT '0',
  `UserID` int(11) NOT NULL DEFAULT '0',
  `putTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  `isTaken` int(11) NOT NULL,
  PRIMARY KEY (`UserID`,`ItemID`,`putTime`),
  KEY `UserID` (`UserID`),
  KEY `ItemID` (`ItemID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `Reserve`
--

INSERT INTO `Reserve` (`ItemID`, `UserID`, `putTime`, `isTaken`) VALUES
(2, 9, '2012-05-09 20:32:49', 0),
(9, 10, '2012-05-09 19:16:57', 0),
(9, 11, '2012-05-09 19:16:57', 0);

-- --------------------------------------------------------

--
-- Stand-in structure for view `ReserveQueue`
--
CREATE TABLE IF NOT EXISTS `ReserveQueue` (
`UserID` int(11)
,`ItemID` int(11)
,`putTime` timestamp
,`StillValid` int(1)
,`ValidUntil` datetime
);
-- --------------------------------------------------------

--
-- Table structure for table `Returns`
--

CREATE TABLE IF NOT EXISTS `Returns` (
  `UserID` int(11) DEFAULT NULL,
  `ItemID` int(11) DEFAULT NULL,
  `StaffID` int(11) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `amount` double DEFAULT NULL,
  KEY `UserID` (`UserID`),
  KEY `StaffID` (`StaffID`),
  KEY `ItemID` (`ItemID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `Returns`
--

INSERT INTO `Returns` (`UserID`, `ItemID`, `StaffID`, `date`, `amount`) VALUES
(10, 4, 4, '2012-05-07 23:51:56', 10),
(10, 5, 2, '2012-05-08 00:41:11', 10),
(9, 5, 2, '2012-05-08 00:41:19', 0),
(9, 7, 2, '2012-05-08 00:41:23', 0),
(10, 6, 4, '2012-05-08 01:04:13', 10),
(9, 4, 2, '2012-05-08 22:38:13', 0),
(9, 13, 2, '2012-05-08 22:40:24', 0),
(9, 5, 2, '2012-05-08 22:42:01', 0),
(9, 8, 2, '2012-05-08 22:42:59', 0);

-- --------------------------------------------------------

--
-- Table structure for table `Room`
--

CREATE TABLE IF NOT EXISTS `Room` (
  `RoomName` varchar(255) NOT NULL DEFAULT '',
  `Description` text,
  `count` int(11) NOT NULL,
  PRIMARY KEY (`RoomName`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `Room`
--

INSERT INTO `Room` (`RoomName`, `Description`, `count`) VALUES
('Group', 'A group of people studying room', 15),
('Individual', 'A single person studying room', 35),
('Movie', 'You can watch a movie ;)', 5);

-- --------------------------------------------------------

--
-- Table structure for table `RoomReservation`
--

CREATE TABLE IF NOT EXISTS `RoomReservation` (
  `RoomName` varchar(255) DEFAULT NULL,
  `UserID` int(11) DEFAULT NULL,
  `StartTime` datetime DEFAULT NULL,
  `Duration` int(11) DEFAULT NULL,
  KEY `UserID` (`UserID`),
  KEY `RoomName` (`RoomName`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='latin1_swedish_ci';

--
-- Dumping data for table `RoomReservation`
--

INSERT INTO `RoomReservation` (`RoomName`, `UserID`, `StartTime`, `Duration`) VALUES
('Individual', 11, '2012-05-11 14:23:43', 150),
('Individual', 9, '2012-05-11 12:23:43', 50);

-- --------------------------------------------------------

--
-- Stand-in structure for view `StaffStatistics`
--
CREATE TABLE IF NOT EXISTS `StaffStatistics` (
`StaffID` int(11)
,`count` bigint(21)
,`money` double
,`DateOfBirth` date
,`name` varchar(255)
,`email` text
);
-- --------------------------------------------------------

--
-- Table structure for table `User`
--

CREATE TABLE IF NOT EXISTS `User` (
  `UserID` int(11) NOT NULL AUTO_INCREMENT,
  `Password` varchar(32) DEFAULT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `Type` int(2) DEFAULT NULL,
  `DateOfBirth` date DEFAULT NULL,
  `email` text NOT NULL,
  PRIMARY KEY (`UserID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COMMENT='latin1_swedish_ci' AUTO_INCREMENT=19 ;

--
-- Dumping data for table `User`
--

INSERT INTO `User` (`UserID`, `Password`, `Name`, `Type`, `DateOfBirth`, `email`) VALUES
(1, '202cb962ac59075b964b07152d234b70', 'mustafa', 1, '1991-12-10', 'mustafa91@gmail.com'),
(2, '202cb962ac59075b964b07152d234b70', 'osman', 2, '1930-10-10', 'osman@gmail.com'),
(3, '202cb962ac59075b964b07152d234b70', 'chloe', 2, '1965-10-03', 'chloe@ctu.gov'),
(4, '202cb962ac59075b964b07152d234b70', 'jack', 2, '1985-03-04', 'jack@ctu.gov'),
(9, '827ccb0eea8a706c4c34a16891f84e7b', 'David Palmer', 3, '1950-07-05', 'palmer@hotmail.com'),
(10, '202cb962ac59075b964b07152d234b70', 'Tony Almedia', 5, '1987-10-05', 'almedia@ctu.gov'),
(11, '202cb962ac59075b964b07152d234b70', 'Darth Vader', 4, '1977-05-15', 'vader@empire.gov');

-- --------------------------------------------------------

--
-- Stand-in structure for view `UserConstraints`
--
CREATE TABLE IF NOT EXISTS `UserConstraints` (
`name` varchar(255)
,`UserID` int(11)
,`value` int(11)
);
-- --------------------------------------------------------

--
-- Stand-in structure for view `UserHoldings`
--
CREATE TABLE IF NOT EXISTS `UserHoldings` (
`ItemID` int(11)
,`Title` varchar(255)
,`BorrowDate` date
,`ValidUntil` date
,`IsPassed` int(1)
,`UserID` int(11)
,`MaxExtensionBreached` int(1)
);
-- --------------------------------------------------------

--
-- Table structure for table `UserTable`
--

CREATE TABLE IF NOT EXISTS `UserTable` (
  `type` int(2) NOT NULL DEFAULT '0',
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `UserTable`
--

INSERT INTO `UserTable` (`type`, `name`) VALUES
(1, 'admin'),
(2, 'staff'),
(3, 'privileged'),
(4, 'normal'),
(5, 'guest');

-- --------------------------------------------------------

--
-- Stand-in structure for view `UserTypeConstraints`
--
CREATE TABLE IF NOT EXISTS `UserTypeConstraints` (
`type` int(5)
,`name` varchar(255)
,`explanation` text
,`userType` int(2)
,`value` int(11)
,`user` varchar(255)
);
-- --------------------------------------------------------

--
-- Table structure for table `Video`
--

CREATE TABLE IF NOT EXISTS `Video` (
  `ItemID` int(11) NOT NULL DEFAULT '0',
  `Director` varchar(255) DEFAULT NULL,
  `ProductionYear` int(4) DEFAULT NULL,
  `Producer` varchar(255) DEFAULT NULL,
  `Duration` int(5) DEFAULT NULL,
  PRIMARY KEY (`ItemID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `Video`
--

INSERT INTO `Video` (`ItemID`, `Director`, `ProductionYear`, `Producer`, `Duration`) VALUES
(3, 'George Lucas', 2005, 'LucasArts', 132),
(4, 'George Lucas', 2002, 'LucasArts', 132),
(5, 'George Lucas', 1999, 'LucasArts', 150);

-- --------------------------------------------------------

--
-- Structure for view `BorrowCheck`
--
DROP TABLE IF EXISTS `BorrowCheck`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `BorrowCheck` AS select `B`.`UserID` AS `UserID`,`B`.`ItemID` AS `ItemID`,`B`.`BorrowDate` AS `BorrowDate`,(`B`.`BorrowDate` + interval (`UC`.`value` * (`B`.`ExtensionCount` + 1)) day) AS `ValidUntil`,((`B`.`BorrowDate` + interval (`UC`.`value` * (`B`.`ExtensionCount` + 1)) day) < curdate()) AS `IsPassed`,(`B`.`ExtensionCount` > `UC2`.`value`) AS `MaxExtensionBreached` from ((`Borrow` `B` join `UserConstraints` `UC`) join `UserConstraints` `UC2`) where ((`B`.`UserID` = `UC`.`UserID`) and (`UC2`.`UserID` = `B`.`UserID`) and (`UC`.`name` = 'TakeawayDays') and (`UC2`.`name` = 'MaxExtensions'));

-- --------------------------------------------------------

--
-- Structure for view `LateCheckouts`
--
DROP TABLE IF EXISTS `LateCheckouts`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `LateCheckouts` AS select (((to_days(`BC`.`ValidUntil`) - to_days(`BC`.`BorrowDate`)) * `BC`.`IsPassed`) * `UC`.`value`) AS `Price`,`BC`.`UserID` AS `UserID`,`BC`.`ItemID` AS `ItemID` from (`BorrowCheck` `BC` join `UserConstraints` `UC`) where ((`BC`.`UserID` = `UC`.`UserID`) and (`UC`.`name` = 'DelayDue'));

-- --------------------------------------------------------

--
-- Structure for view `LoginCheck`
--
DROP TABLE IF EXISTS `LoginCheck`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `LoginCheck` AS select `U`.`Name` AS `Username`,`MH`.`UserID` AS `UserID`,((max(`MH`.`ExpireDate`) > curdate()) or (`U`.`Type` = 1)) AS `IsExpired`,`U`.`email` AS `email`,`U`.`Password` AS `Password`,`UT`.`name` AS `UserType` from ((`MembershipHistory` `MH` join `User` `U`) join `UserTable` `UT`) where ((`U`.`UserID` = `MH`.`UserID`) and (`UT`.`type` = `U`.`Type`)) group by `MH`.`UserID`;

-- --------------------------------------------------------

--
-- Structure for view `ReserveQueue`
--
DROP TABLE IF EXISTS `ReserveQueue`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `ReserveQueue` AS select `UC`.`UserID` AS `UserID`,`R`.`ItemID` AS `ItemID`,`R`.`putTime` AS `putTime`,(now() < (`R`.`putTime` + interval `UC`.`value` day)) AS `StillValid`,(`R`.`putTime` + interval `UC`.`value` day) AS `ValidUntil` from (`UserConstraints` `UC` join `Reserve` `R`) where ((`UC`.`name` = 'ReservePeriod') and (`R`.`UserID` = `UC`.`UserID`) and (`R`.`isTaken` = 0)) order by `R`.`putTime`;

-- --------------------------------------------------------

--
-- Structure for view `StaffStatistics`
--
DROP TABLE IF EXISTS `StaffStatistics`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `StaffStatistics` AS select `R`.`StaffID` AS `StaffID`,count(`R`.`date`) AS `count`,sum(`R`.`amount`) AS `money`,`U`.`DateOfBirth` AS `DateOfBirth`,`U`.`Name` AS `name`,`U`.`email` AS `email` from (`User` `U` join `Returns` `R`) where (`R`.`StaffID` = `U`.`UserID`) group by `R`.`StaffID`;

-- --------------------------------------------------------

--
-- Structure for view `UserConstraints`
--
DROP TABLE IF EXISTS `UserConstraints`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `UserConstraints` AS select `ConstraintTable`.`name` AS `name`,`User`.`UserID` AS `UserID`,`Constraints`.`value` AS `value` from ((`ConstraintTable` join `Constraints`) join `User`) where ((`ConstraintTable`.`type` = `Constraints`.`constraintType`) and (`User`.`Type` = `Constraints`.`userType`));

-- --------------------------------------------------------

--
-- Structure for view `UserHoldings`
--
DROP TABLE IF EXISTS `UserHoldings`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `UserHoldings` AS select `I`.`ItemID` AS `ItemID`,`I`.`Title` AS `Title`,`B`.`BorrowDate` AS `BorrowDate`,`BC`.`ValidUntil` AS `ValidUntil`,`BC`.`IsPassed` AS `IsPassed`,`B`.`UserID` AS `UserID`,`BC`.`MaxExtensionBreached` AS `MaxExtensionBreached` from ((`Item` `I` join `Borrow` `B`) join `BorrowCheck` `BC`) where ((`I`.`ItemID` = `B`.`ItemID`) and (`B`.`ItemID` = `BC`.`ItemID`) and (`B`.`UserID` = `BC`.`UserID`));

-- --------------------------------------------------------

--
-- Structure for view `UserTypeConstraints`
--
DROP TABLE IF EXISTS `UserTypeConstraints`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `UserTypeConstraints` AS select `CT`.`type` AS `type`,`CT`.`name` AS `name`,`CT`.`explanation` AS `explanation`,`C`.`userType` AS `userType`,`C`.`value` AS `value`,`UT`.`name` AS `user` from ((`Constraints` `C` join `ConstraintTable` `CT`) join `UserTable` `UT`) where ((`C`.`constraintType` = `CT`.`type`) and (`UT`.`type` = `C`.`userType`));

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Audio`
--
ALTER TABLE `Audio`
  ADD CONSTRAINT `Audio_ibfk_1` FOREIGN KEY (`ItemID`) REFERENCES `Item` (`ItemID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Book`
--
ALTER TABLE `Book`
  ADD CONSTRAINT `Book_ibfk_1` FOREIGN KEY (`ItemID`) REFERENCES `Item` (`ItemID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Borrow`
--
ALTER TABLE `Borrow`
  ADD CONSTRAINT `Borrow_ibfk_1` FOREIGN KEY (`ItemID`) REFERENCES `Item` (`ItemID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `CommentAndRate`
--
ALTER TABLE `CommentAndRate`
  ADD CONSTRAINT `CommentAndRate_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `User` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `CommentAndRate_ibfk_2` FOREIGN KEY (`itemID`) REFERENCES `Item` (`ItemID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Constraints`
--
ALTER TABLE `Constraints`
  ADD CONSTRAINT `Constraints_ibfk_1` FOREIGN KEY (`constraintType`) REFERENCES `ConstraintTable` (`type`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Constraints_ibfk_2` FOREIGN KEY (`userType`) REFERENCES `UserTable` (`type`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `EMaterial`
--
ALTER TABLE `EMaterial`
  ADD CONSTRAINT `EMaterial_ibfk_1` FOREIGN KEY (`ItemID`) REFERENCES `Item` (`ItemID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `MembershipHistory`
--
ALTER TABLE `MembershipHistory`
  ADD CONSTRAINT `MembershipHistory_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Reserve`
--
ALTER TABLE `Reserve`
  ADD CONSTRAINT `Reserve_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Reserve_ibfk_2` FOREIGN KEY (`ItemID`) REFERENCES `Item` (`ItemID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Returns`
--
ALTER TABLE `Returns`
  ADD CONSTRAINT `Returns_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Returns_ibfk_2` FOREIGN KEY (`StaffID`) REFERENCES `User` (`UserID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Returns_ibfk_3` FOREIGN KEY (`ItemID`) REFERENCES `Item` (`ItemID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `RoomReservation`
--
ALTER TABLE `RoomReservation`
  ADD CONSTRAINT `RoomReservation_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `User` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `RoomReservation_ibfk_2` FOREIGN KEY (`RoomName`) REFERENCES `Room` (`RoomName`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Video`
--
ALTER TABLE `Video`
  ADD CONSTRAINT `Video_ibfk_1` FOREIGN KEY (`ItemID`) REFERENCES `Item` (`ItemID`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
