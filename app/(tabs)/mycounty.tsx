import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

const COLORS = {
  green: '#1a7a4a',
  greenDark: '#145c38',
  greenLight: '#f0faf5',
  white: '#FFFFFF',
  bg: '#F7F7F7',
  border: '#F0F0F0',
  text: '#111111',
  subtext: '#888888',
  red: '#E63946',
};

// ─── All 47 Counties ──────────────────────────────────────────────────────────

const COUNTIES = [
  {
    id: '1', name: 'Mombasa', region: 'Coast',
    population: 1208333, registeredVoters: 485234,
    constituencies: 6, wards: 30,
    electedLeaders: [
      { initials: 'AK', name: 'Abdulswamad Nassir', role: 'Governor', color: '#2D6A4F' },
      { initials: 'OK', name: 'Omar Mwinyi', role: 'Senator', color: '#457B9D' },
      { initials: 'FA', name: 'Fatuma Achani', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'AK', name: 'Ali King\'ang\'i', role: 'Member of Parliament', color: '#2A9D8F' },
      { initials: 'SM', name: 'Suleiman Murunga', role: 'Member of Parliament', color: '#6D4C8B' },
    ],
  },
  {
    id: '2', name: 'Kwale', region: 'Coast',
    population: 866820, registeredVoters: 312450,
    constituencies: 4, wards: 20,
    electedLeaders: [
      { initials: 'FK', name: 'Fatuma Achani', role: 'Governor', color: '#2D6A4F' },
      { initials: 'JM', name: 'Issa Boy', role: 'Senator', color: '#457B9D' },
      { initials: 'ZM', name: 'Zulekha Magoma', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'BM', name: 'Bady Twalib', role: 'Member of Parliament', color: '#2A9D8F' },
      { initials: 'SM', name: 'Sirma Mwanje', role: 'Member of Parliament', color: '#6D4C8B' },
    ],
  },
  {
    id: '3', name: 'Kilifi', region: 'Coast',
    population: 1453787, registeredVoters: 521000,
    constituencies: 7, wards: 35,
    electedLeaders: [
      { initials: 'GK', name: 'Gideon Mung\'aro', role: 'Governor', color: '#2D6A4F' },
      { initials: 'SM', name: 'Stewart Madzayo', role: 'Senator', color: '#457B9D' },
      { initials: 'AM', name: 'Aisha Jumwa', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'OM', name: 'Owen Baya', role: 'Member of Parliament', color: '#2A9D8F' },
      { initials: 'KK', name: 'Ken Chonga', role: 'Member of Parliament', color: '#6D4C8B' },
    ],
  },
  {
    id: '4', name: 'Tana River', region: 'Coast',
    population: 315943, registeredVoters: 98450,
    constituencies: 3, wards: 15,
    electedLeaders: [
      { initials: 'DG', name: 'Dhadho Godhana', role: 'Governor', color: '#2D6A4F' },
      { initials: 'DM', name: 'Danson Mungatana', role: 'Senator', color: '#457B9D' },
      { initials: 'HM', name: 'Hezena Lemaletian', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'AM', name: 'Ali Wario', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '5', name: 'Lamu', region: 'Coast',
    population: 143920, registeredVoters: 52340,
    constituencies: 2, wards: 10,
    electedLeaders: [
      { initials: 'IB', name: 'Issa Boy', role: 'Governor', color: '#2D6A4F' },
      { initials: 'AM', name: 'Anwar Loitiptip', role: 'Senator', color: '#457B9D' },
      { initials: 'RO', name: 'Ruweida Obo', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'RA', name: 'Ruweida Obo', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '6', name: 'Taita-Taveta', region: 'Coast',
    population: 340671, registeredVoters: 124500,
    constituencies: 4, wards: 20,
    electedLeaders: [
      { initials: 'AM', name: 'Andrew Mwadime', role: 'Governor', color: '#2D6A4F' },
      { initials: 'JM', name: 'Jones Mwambi', role: 'Senator', color: '#457B9D' },
      { initials: 'GK', name: 'Getrude Mbeyu', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'NK', name: 'Naomi Shaban', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '7', name: 'Garissa', region: 'North Eastern',
    population: 841353, registeredVoters: 198450,
    constituencies: 6, wards: 30,
    electedLeaders: [
      { initials: 'NA', name: 'Nathif Jama', role: 'Governor', color: '#2D6A4F' },
      { initials: 'AM', name: 'Ali Roba', role: 'Senator', color: '#457B9D' },
      { initials: 'FM', name: 'Fardosa Dida', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'AD', name: 'Aden Duale', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '8', name: 'Wajir', region: 'North Eastern',
    population: 781263, registeredVoters: 167800,
    constituencies: 6, wards: 30,
    electedLeaders: [
      { initials: 'AM', name: 'Ahmed Abdullahi', role: 'Governor', color: '#2D6A4F' },
      { initials: 'AM', name: 'Abdul Haji', role: 'Senator', color: '#457B9D' },
      { initials: 'FM', name: 'Fatuma Ibrahim', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'IM', name: 'Ibrahim Ahmed', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '9', name: 'Mandera', region: 'North Eastern',
    population: 1025756, registeredVoters: 212000,
    constituencies: 6, wards: 30,
    electedLeaders: [
      { initials: 'MA', name: 'Mohamed Khalif', role: 'Governor', color: '#2D6A4F' },
      { initials: 'AM', name: 'Ali Roba', role: 'Senator', color: '#457B9D' },
      { initials: 'FM', name: 'Shamsa Bare', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'OM', name: 'Omar Mohamed', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '10', name: 'Marsabit', region: 'North Eastern',
    population: 459785, registeredVoters: 134500,
    constituencies: 4, wards: 20,
    electedLeaders: [
      { initials: 'MK', name: 'Mohamud Ali', role: 'Governor', color: '#2D6A4F' },
      { initials: 'SM', name: 'Sora Godana', role: 'Senator', color: '#457B9D' },
      { initials: 'FM', name: 'Fatuma Dullo', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'CD', name: 'Chachu Ganya', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '11', name: 'Isiolo', region: 'Eastern',
    population: 268002, registeredVoters: 87600,
    constituencies: 2, wards: 10,
    electedLeaders: [
      { initials: 'AA', name: 'Abdi Ibrahim', role: 'Governor', color: '#2D6A4F' },
      { initials: 'AM', name: 'Fatuma Dullo', role: 'Senator', color: '#457B9D' },
      { initials: 'FM', name: 'Rehema Hassan', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'AM', name: 'Abdi Korist', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '12', name: 'Meru', region: 'Eastern',
    population: 1545714, registeredVoters: 612000,
    constituencies: 9, wards: 45,
    electedLeaders: [
      { initials: 'KL', name: 'Kawira Mwangaza', role: 'Governor', color: '#2D6A4F' },
      { initials: 'KM', name: 'Kathuri Murungi', role: 'Senator', color: '#457B9D' },
      { initials: 'LM', name: 'Linah Kilimo', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'PM', name: 'Rahim Dawood', role: 'Member of Parliament', color: '#2A9D8F' },
      { initials: 'JM', name: 'John Mutunga', role: 'Member of Parliament', color: '#6D4C8B' },
    ],
  },
  {
    id: '13', name: 'Tharaka-Nithi', region: 'Eastern',
    population: 393177, registeredVoters: 145600,
    constituencies: 3, wards: 15,
    electedLeaders: [
      { initials: 'EM', name: 'Eric Muchangi', role: 'Governor', color: '#2D6A4F' },
      { initials: 'CM', name: 'Chute Muriuki', role: 'Senator', color: '#457B9D' },
      { initials: 'GM', name: 'Getrude Murugi', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'DM', name: 'Dickson Githinji', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '14', name: 'Embu', region: 'Eastern',
    population: 608599, registeredVoters: 234500,
    constituencies: 4, wards: 20,
    electedLeaders: [
      { initials: 'TM', name: 'Titus Mbathi', role: 'Governor', color: '#2D6A4F' },
      { initials: 'LM', name: 'Lenny Kivuti', role: 'Senator', color: '#457B9D' },
      { initials: 'RM', name: 'Rebecca Miano', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'AM', name: 'Johnes Muthomi', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '15', name: 'Kitui', region: 'Eastern',
    population: 1136187, registeredVoters: 412000,
    constituencies: 8, wards: 40,
    electedLeaders: [
      { initials: 'JM', name: 'Julius Malombe', role: 'Governor', color: '#2D6A4F' },
      { initials: 'EM', name: 'Enoch Wambua', role: 'Senator', color: '#457B9D' },
      { initials: 'EM', name: 'Edith Vethi', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'DM', name: 'Daniel Maanzo', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '16', name: 'Machakos', region: 'Eastern',
    population: 1421932, registeredVoters: 534000,
    constituencies: 8, wards: 40,
    electedLeaders: [
      { initials: 'WM', name: 'Wavinya Ndeti', role: 'Governor', color: '#2D6A4F' },
      { initials: 'AM', name: 'Agnes Kavindu', role: 'Senator', color: '#457B9D' },
      { initials: 'JM', name: 'Jessica Ndeto', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'PM', name: 'Patrick Makau', role: 'Member of Parliament', color: '#2A9D8F' },
      { initials: 'VM', name: 'Victor Munyaka', role: 'Member of Parliament', color: '#6D4C8B' },
    ],
  },
  {
    id: '17', name: 'Makueni', region: 'Eastern',
    population: 987653, registeredVoters: 367000,
    constituencies: 6, wards: 30,
    electedLeaders: [
      { initials: 'PM', name: 'Mutula Kilonzo Jnr', role: 'Governor', color: '#2D6A4F' },
      { initials: 'DM', name: 'Daniel Maanzo', role: 'Senator', color: '#457B9D' },
      { initials: 'RM', name: 'Rose Museo', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'EM', name: 'Emmah Mwende', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '18', name: 'Nyandarua', region: 'Central',
    population: 638289, registeredVoters: 256000,
    constituencies: 5, wards: 25,
    electedLeaders: [
      { initials: 'KK', name: 'Kiarie Badilisha', role: 'Governor', color: '#2D6A4F' },
      { initials: 'JK', name: 'John Methu', role: 'Senator', color: '#457B9D' },
      { initials: 'GK', name: 'Grace Kuria', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'FK', name: 'Florah Mutua', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '19', name: 'Nyeri', region: 'Central',
    population: 759164, registeredVoters: 312000,
    constituencies: 6, wards: 30,
    electedLeaders: [
      { initials: 'MW', name: 'Mutahi Kahiga', role: 'Governor', color: '#2D6A4F' },
      { initials: 'TK', name: 'Titus Njogu', role: 'Senator', color: '#457B9D' },
      { initials: 'JM', name: 'Rahab Mukami', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'IK', name: 'Ingrid Munyasya', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '20', name: 'Kirinyaga', region: 'Central',
    population: 610411, registeredVoters: 245000,
    constituencies: 5, wards: 25,
    electedLeaders: [
      { initials: 'AW', name: 'Anne Waiguru', role: 'Governor', color: '#2D6A4F' },
      { initials: 'CM', name: 'Charles Kibiru', role: 'Senator', color: '#457B9D' },
      { initials: 'PM', name: 'Purity Ngirici', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'GM', name: 'Gitonga Mukunji', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '21', name: 'Murang\'a', region: 'Central',
    population: 1056640, registeredVoters: 423000,
    constituencies: 7, wards: 35,
    electedLeaders: [
      { initials: 'IK', name: 'Irungu Kang\'ata', role: 'Governor', color: '#2D6A4F' },
      { initials: 'JM', name: 'Joe Nyutu', role: 'Senator', color: '#457B9D' },
      { initials: 'SM', name: 'Sabina Chege', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'GK', name: 'Githiaka Kinoti', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '22', name: 'Kiambu', region: 'Central',
    population: 2417735, registeredVoters: 987000,
    constituencies: 12, wards: 60,
    electedLeaders: [
      { initials: 'KW', name: 'Kimani Wamatangi', role: 'Governor', color: '#2D6A4F' },
      { initials: 'KM', name: 'Karungo Thangwa', role: 'Senator', color: '#457B9D' },
      { initials: 'GW', name: 'Grace Wanjiru', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'JM', name: 'James Mwangi', role: 'Member of Parliament', color: '#2A9D8F' },
      { initials: 'KK', name: 'Kuria Kimani', role: 'Member of Parliament', color: '#6D4C8B' },
    ],
  },
  {
    id: '23', name: 'Turkana', region: 'Rift Valley',
    population: 926976, registeredVoters: 267000,
    constituencies: 6, wards: 30,
    electedLeaders: [
      { initials: 'JN', name: 'Jeremiah Lomorukai', role: 'Governor', color: '#2D6A4F' },
      { initials: 'JL', name: 'James Lomenen', role: 'Senator', color: '#457B9D' },
      { initials: 'EL', name: 'Esther Loiyan', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'EK', name: 'Emmanuel Kipsengeret', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '24', name: 'West Pokot', region: 'Rift Valley',
    population: 621241, registeredVoters: 167000,
    constituencies: 4, wards: 20,
    electedLeaders: [
      { initials: 'JL', name: 'John Lonyangapuo', role: 'Governor', color: '#2D6A4F' },
      { initials: 'CK', name: 'Chris Momanyi', role: 'Senator', color: '#457B9D' },
      { initials: 'FK', name: 'Felista Koskei', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'DK', name: 'David Pkosing', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '25', name: 'Samburu', region: 'Rift Valley',
    population: 310327, registeredVoters: 89000,
    constituencies: 3, wards: 15,
    electedLeaders: [
      { initials: 'JL', name: 'Jonathan Lelelit', role: 'Governor', color: '#2D6A4F' },
      { initials: 'SS', name: 'Steve Lelegwe', role: 'Senator', color: '#457B9D' },
      { initials: 'RL', name: 'Rehema Lekuton', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'JL', name: 'Joseph Lekuton', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '26', name: 'Trans Nzoia', region: 'Rift Valley',
    population: 990341, registeredVoters: 367000,
    constituencies: 5, wards: 25,
    electedLeaders: [
      { initials: 'GN', name: 'George Natembeya', role: 'Governor', color: '#2D6A4F' },
      { initials: 'BM', name: 'Blessed Wekesa', role: 'Senator', color: '#457B9D' },
      { initials: 'JW', name: 'Janet Wakhungu', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'PW', name: 'Patrick Makau', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '27', name: 'Uasin Gishu', region: 'Rift Valley',
    population: 1163186, registeredVoters: 467000,
    constituencies: 6, wards: 30,
    electedLeaders: [
      { initials: 'JB', name: 'Jonathan Bii', role: 'Governor', color: '#2D6A4F' },
      { initials: 'JC', name: 'Jackson Mandago', role: 'Senator', color: '#457B9D' },
      { initials: 'GC', name: 'Grace Chebet', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'OK', name: 'Oscar Sudi', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '28', name: 'Elgeyo-Marakwet', region: 'Rift Valley',
    population: 454480, registeredVoters: 167000,
    constituencies: 4, wards: 20,
    electedLeaders: [
      { initials: 'WK', name: 'Wisley Rotich', role: 'Governor', color: '#2D6A4F' },
      { initials: 'AK', name: 'Aaron Cheruiyot', role: 'Senator', color: '#457B9D' },
      { initials: 'EK', name: 'Emmah Korir', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'WK', name: 'William Kisang', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '29', name: 'Nandi', region: 'Rift Valley',
    population: 885711, registeredVoters: 334000,
    constituencies: 6, wards: 30,
    electedLeaders: [
      { initials: 'SN', name: 'Stephen Sang', role: 'Governor', color: '#2D6A4F' },
      { initials: 'SM', name: 'Samson Cherargei', role: 'Senator', color: '#457B9D' },
      { initials: 'CM', name: 'Cynthia Muge', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'BK', name: 'Benjamin Langat', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '30', name: 'Baringo', region: 'Rift Valley',
    population: 666763, registeredVoters: 234000,
    constituencies: 6, wards: 30,
    electedLeaders: [
      { initials: 'BK', name: 'Benjamin Cheboi', role: 'Governor', color: '#2D6A4F' },
      { initials: 'JL', name: 'Julius Lel', role: 'Senator', color: '#457B9D' },
      { initials: 'DK', name: 'Doris Koech', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'WK', name: 'William Cheptumo', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '31', name: 'Laikipia', region: 'Rift Valley',
    population: 518560, registeredVoters: 212000,
    constituencies: 3, wards: 15,
    electedLeaders: [
      { initials: 'JN', name: 'Joshua Irungu', role: 'Governor', color: '#2D6A4F' },
      { initials: 'JN', name: 'John Kinyua', role: 'Senator', color: '#457B9D' },
      { initials: 'CM', name: 'Catherine Waruguru', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'SN', name: 'Sarah Korere', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '32', name: 'Nakuru', region: 'Rift Valley',
    population: 2162202, registeredVoters: 856000,
    constituencies: 11, wards: 55,
    electedLeaders: [
      { initials: 'SK', name: 'Susan Kihika', role: 'Governor', color: '#2D6A4F' },
      { initials: 'JN', name: 'Joseph Kangethe', role: 'Senator', color: '#457B9D' },
      { initials: 'LN', name: 'Liza Chelule', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'DR', name: 'David Rotich', role: 'Member of Parliament', color: '#2A9D8F' },
      { initials: 'GW', name: 'Grace Wanjiru', role: 'Member of Parliament', color: '#6D4C8B' },
    ],
  },
  {
    id: '33', name: 'Narok', region: 'Rift Valley',
    population: 1157873, registeredVoters: 389000,
    constituencies: 6, wards: 30,
    electedLeaders: [
      { initials: 'PO', name: 'Patrick Ole Ntutu', role: 'Governor', color: '#2D6A4F' },
      { initials: 'LK', name: 'Ledama Ole Kina', role: 'Senator', color: '#457B9D' },
      { initials: 'SM', name: 'Soipan Tuya', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'MK', name: 'Moitalel Ole Kenta', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '34', name: 'Kajiado', region: 'Rift Valley',
    population: 1117840, registeredVoters: 423000,
    constituencies: 5, wards: 25,
    electedLeaders: [
      { initials: 'JO', name: 'Joseph Ole Lenku', role: 'Governor', color: '#2D6A4F' },
      { initials: 'SM', name: 'Seki Mositet', role: 'Senator', color: '#457B9D' },
      { initials: 'DM', name: 'Doris Momanyi', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'GN', name: 'Gideon Nzioka', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '35', name: 'Kericho', region: 'Rift Valley',
    population: 901777, registeredVoters: 356000,
    constituencies: 6, wards: 30,
    electedLeaders: [
      { initials: 'AM', name: 'Erick Mutai', role: 'Governor', color: '#2D6A4F' },
      { initials: 'AK', name: 'Aaron Cheruiyot', role: 'Senator', color: '#457B9D' },
      { initials: 'JK', name: 'Jane Kiptoo', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'DK', name: 'David Pkosing', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '36', name: 'Bomet', region: 'Rift Valley',
    population: 875689, registeredVoters: 312000,
    constituencies: 5, wards: 25,
    electedLeaders: [
      { initials: 'HK', name: 'Hillary Barchok', role: 'Governor', color: '#2D6A4F' },
      { initials: 'CK', name: 'Christopher Langat', role: 'Senator', color: '#457B9D' },
      { initials: 'LT', name: 'Linet Toto', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'RK', name: 'Ronald Tonui', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '37', name: 'Kakamega', region: 'Western',
    population: 1867579, registeredVoters: 712000,
    constituencies: 12, wards: 60,
    electedLeaders: [
      { initials: 'FK', name: 'Fernandes Barasa', role: 'Governor', color: '#2D6A4F' },
      { initials: 'BM', name: 'Boni Khalwale', role: 'Senator', color: '#457B9D' },
      { initials: 'JM', name: 'Jane Muyeye', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'EO', name: 'Emmanuel Wangwe', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '38', name: 'Vihiga', region: 'Western',
    population: 590013, registeredVoters: 234000,
    constituencies: 5, wards: 25,
    electedLeaders: [
      { initials: 'CV', name: 'Carlos Kharono', role: 'Governor', color: '#2D6A4F' },
      { initials: 'GO', name: 'Godfrey Osotsi', role: 'Senator', color: '#457B9D' },
      { initials: 'EM', name: 'Emily Obiero', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'EM', name: 'Emmanuel Musalia', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '39', name: 'Bungoma', region: 'Western',
    population: 1670570, registeredVoters: 623000,
    constituencies: 9, wards: 45,
    electedLeaders: [
      { initials: 'KM', name: 'Ken Lusaka', role: 'Governor', color: '#2D6A4F' },
      { initials: 'WW', name: 'Wafula Wakoli', role: 'Senator', color: '#457B9D' },
      { initials: 'EM', name: 'Emily Simiyu', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'JM', name: 'John Makali', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '40', name: 'Busia', region: 'Western',
    population: 893681, registeredVoters: 334000,
    constituencies: 7, wards: 35,
    electedLeaders: [
      { initials: 'PM', name: 'Paul Otuoma', role: 'Governor', color: '#2D6A4F' },
      { initials: 'OO', name: 'Okiya Omtatah', role: 'Senator', color: '#457B9D' },
      { initials: 'EM', name: 'Emily Omamo', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'BO', name: 'Bunyasi Odula', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '41', name: 'Siaya', region: 'Nyanza',
    population: 993183, registeredVoters: 389000,
    constituencies: 6, wards: 30,
    electedLeaders: [
      { initials: 'JO', name: 'James Orengo', role: 'Governor', color: '#2D6A4F' },
      { initials: 'CO', name: 'Caroli Omondi', role: 'Senator', color: '#457B9D' },
      { initials: 'RO', name: 'Rosa Buyu', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'AO', name: 'Alego Usonga', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '42', name: 'Kisumu', region: 'Nyanza',
    population: 1155574, registeredVoters: 456000,
    constituencies: 7, wards: 35,
    electedLeaders: [
      { initials: 'AM', name: 'Anyang Nyong\'o', role: 'Governor', color: '#2D6A4F' },
      { initials: 'TO', name: 'Tom Ojienda', role: 'Senator', color: '#457B9D' },
      { initials: 'RM', name: 'Rosa Buyu', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'PO', name: 'Peter Odhiambo', role: 'Member of Parliament', color: '#2A9D8F' },
      { initials: 'TW', name: 'Tim Wanyonyi', role: 'Member of Parliament', color: '#6D4C8B' },
    ],
  },
  {
    id: '43', name: 'Homa Bay', region: 'Nyanza',
    population: 1131950, registeredVoters: 412000,
    constituencies: 8, wards: 40,
    electedLeaders: [
      { initials: 'WO', name: 'Gladys Wanga', role: 'Governor', color: '#2D6A4F' },
      { initials: 'AO', name: 'Ayacko Ochillo', role: 'Senator', color: '#457B9D' },
      { initials: 'EM', name: 'Eve Obara', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'MO', name: 'Mark Obama Ndesandjo', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '44', name: 'Migori', region: 'Nyanza',
    population: 1116436, registeredVoters: 412000,
    constituencies: 8, wards: 40,
    electedLeaders: [
      { initials: 'OO', name: 'Ochillo Ayacko', role: 'Governor', color: '#2D6A4F' },
      { initials: 'EO', name: 'Eddy Oketch', role: 'Senator', color: '#457B9D' },
      { initials: 'PM', name: 'Pamela Odhiambo', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'JO', name: 'John Kobado', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '45', name: 'Kisii', region: 'Nyanza',
    population: 1266860, registeredVoters: 489000,
    constituencies: 9, wards: 45,
    electedLeaders: [
      { initials: 'SM', name: 'Simba Arati', role: 'Governor', color: '#2D6A4F' },
      { initials: 'OK', name: 'Okong\'o Omogeni', role: 'Senator', color: '#457B9D' },
      { initials: 'DM', name: 'Doris Obiri', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'RM', name: 'Richard Tongi', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '46', name: 'Nyamira', region: 'Nyanza',
    population: 605576, registeredVoters: 234000,
    constituencies: 4, wards: 20,
    electedLeaders: [
      { initials: 'RN', name: 'Amos Nyaribo', role: 'Governor', color: '#2D6A4F' },
      { initials: 'CM', name: 'Okong\'o Mogeni', role: 'Senator', color: '#457B9D' },
      { initials: 'JM', name: 'Jerusha Momanyi', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'TM', name: 'Timothy Bosire', role: 'Member of Parliament', color: '#2A9D8F' },
    ],
  },
  {
    id: '47', name: 'Nairobi', region: 'Nairobi',
    population: 4397073, registeredVoters: 2589345,
    constituencies: 17, wards: 85,
    electedLeaders: [
      { initials: 'JS', name: 'Johnson Sakaja', role: 'Governor', color: '#2D6A4F' },
      { initials: 'ES', name: 'Edwin Sifuna', role: 'Senator', color: '#457B9D' },
      { initials: 'EP', name: 'Esther Passaris', role: 'Woman Rep', color: '#E76F51' },
    ],
    mps: [
      { initials: 'AD', name: 'Aden Duale', role: 'Member of Parliament', color: '#2A9D8F' },
      { initials: 'TW', name: 'Tim Wanyonyi', role: 'Member of Parliament', color: '#6D4C8B' },
      { initials: 'LG', name: 'Lempurkel GG', role: 'Member of Parliament', color: '#388E3C' },
      { initials: 'MM', name: 'Mark Mwenje', role: 'Member of Parliament', color: '#5C6BC0' },
      { initials: 'NM', name: 'Nimrod Mbai', role: 'Member of Parliament', color: '#E76F51' },
    ],
  },
];

type County = typeof COUNTIES[0];

// ─── County Picker Modal ──────────────────────────────────────────────────────

function CountyPicker({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: County;
  onSelect: (c: County) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select County</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={COUNTIES}
            keyExtractor={c => c.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.pickerItem, item.id === selected.id && styles.pickerItemActive]}
                onPress={() => { onSelect(item); onClose(); }}
              >
                <Text style={[styles.pickerItemText, item.id === selected.id && styles.pickerItemTextActive]}>
                  {item.name}
                </Text>
                <Text style={styles.pickerRegion}>{item.region}</Text>
                {item.id === selected.id && (
                  <Ionicons name="checkmark" size={16} color={COLORS.green} style={{ marginLeft: 'auto' }} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MyCountyScreen() {
  const router = useRouter();
  const [county, setCounty] = useState<County>(COUNTIES[46]); // Nairobi default
  const [pickerVisible, setPickerVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.green} />

      {/* Green header */}
      <View style={styles.greenHeader}>
        <Text style={styles.myCountyLabel}>MY COUNTY</Text>
        <Text style={styles.countyName}>{county.name} County</Text>
        <View style={styles.regionRow}>
          <View style={styles.regionDot} />
          <Text style={styles.regionText}>Kenya</Text>
        </View>

        {/* County dropdown */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setPickerVisible(true)}
        >
          <Text style={styles.dropdownText}>{county.name}</Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.green} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.bg }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Map placeholder */}
        <View style={styles.mapCard}>
          <Ionicons name="location-outline" size={32} color={COLORS.green} />
          <Text style={styles.mapTitle}>{county.name} County Map</Text>
          <Text style={styles.mapSub}>Interactive map coming soon</Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconRow}>
                <Ionicons name="people-outline" size={13} color={COLORS.subtext} />
                <Text style={styles.statLabel}>POPULATION</Text>
              </View>
              <Text style={styles.statValue}>{county.population.toLocaleString()}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIconRow}>
                <Ionicons name="card-outline" size={13} color={COLORS.subtext} />
                <Text style={styles.statLabel}>REGISTERED VOTERS</Text>
              </View>
              <Text style={styles.statValue}>{county.registeredVoters.toLocaleString()}</Text>
            </View>
          </View>
          <View style={[styles.statsRow, { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, marginTop: 4 }]}>
            <View style={styles.statItem}>
              <View style={styles.statIconRow}>
                <Ionicons name="business-outline" size={13} color={COLORS.subtext} />
                <Text style={styles.statLabel}>CONSTITUENCIES</Text>
              </View>
              <Text style={styles.statValue}>{county.constituencies}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIconRow}>
                <Ionicons name="grid-outline" size={13} color={COLORS.subtext} />
                <Text style={styles.statLabel}>WARDS</Text>
              </View>
              <Text style={styles.statValue}>{county.wards}</Text>
            </View>
          </View>
        </View>

        {/* Elected Leaders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Elected Leaders</Text>
          {county.electedLeaders.map((leader, i) => (
            <TouchableOpacity
              key={i}
              style={styles.leaderRow}
              onPress={() => router.push(`/candidate/${leader.name}` as any)}
            >
              <View style={[styles.leaderAvatar, { backgroundColor: leader.color }]}>
                <Text style={styles.leaderAvatarText}>{leader.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.leaderName}>{leader.name}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{leader.role}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.subtext} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Members of Parliament */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Members of Parliament</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{county.mps.length}</Text>
            </View>
          </View>
          {county.mps.map((mp, i) => (
            <TouchableOpacity
              key={i}
              style={styles.leaderRow}
              onPress={() => router.push(`/candidate/${mp.name}` as any)}
            >
              <View style={[styles.leaderAvatar, { backgroundColor: mp.color }]}>
                <Text style={styles.leaderAvatarText}>{mp.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.leaderName}>{mp.name}</Text>
                <Text style={styles.mpRole}>{mp.role}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.subtext} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <CountyPicker
        visible={pickerVisible}
        selected={county}
        onSelect={setCounty}
        onClose={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.green,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  greenHeader: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  myCountyLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  countyName: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 2,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
    marginBottom: 12,
  },
  regionDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },
  regionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.green,
  },
  mapCard: {
    backgroundColor: COLORS.white,
    margin: 12,
    borderRadius: 12,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.green,
  },
  mapSub: {
    fontSize: 11,
    color: COLORS.subtext,
  },
  statsCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    gap: 4,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.subtext,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  countBadge: {
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 12,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.subtext,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  leaderAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderAvatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  leaderName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.greenLight,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginTop: 3,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.green,
  },
  mpRole: {
    fontSize: 11,
    color: COLORS.subtext,
    marginTop: 2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  pickerItemActive: {
    backgroundColor: COLORS.greenLight,
  },
  pickerItemText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  pickerItemTextActive: {
    color: COLORS.green,
    fontWeight: '700',
  },
  pickerRegion: {
    fontSize: 11,
    color: COLORS.subtext,
    marginLeft: 4,
  },
  
});