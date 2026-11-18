export type TransactionType = 'UPI' | 'P2P' | 'P2M';

export interface TransactionInput {
  amount: number;
  transaction_type: TransactionType;
  hour: number;
  location_match: 0 | 1;
  device_match: 0 | 1;
  daily_transactions: number;
  failed_attempts: number;
  new_beneficiary: 0 | 1;
}

export interface DatasetRow extends TransactionInput {
  transaction_id: number;
  is_fraud: 0 | 1;
  source_note: string;
}

export interface EpochMetric {
  epoch: number;
  accuracy: number;
  loss: number;
}

export interface NotebookPreset {
  id: string;
  label: string;
  subtitle: string;
  input: TransactionInput;
}

export interface NotebookCell {
  step: string;
  title: string;
  code: string;
  output?: string;
}

export const ANN_TRAINING_HISTORY: EpochMetric[] = [
  { epoch: 1, accuracy: 0.6106, loss: 0.6870 },
  { epoch: 2, accuracy: 0.7038, loss: 0.5962 },
  { epoch: 3, accuracy: 0.7237, loss: 0.5280 },
  { epoch: 4, accuracy: 0.7688, loss: 0.4647 },
  { epoch: 5, accuracy: 0.8138, loss: 0.4120 },
  { epoch: 6, accuracy: 0.8331, loss: 0.3794 },
  { epoch: 7, accuracy: 0.8413, loss: 0.3608 },
  { epoch: 8, accuracy: 0.8462, loss: 0.3517 },
  { epoch: 9, accuracy: 0.8444, loss: 0.3453 },
  { epoch: 10, accuracy: 0.8462, loss: 0.3413 },
  { epoch: 11, accuracy: 0.8481, loss: 0.3379 },
  { epoch: 12, accuracy: 0.8487, loss: 0.3357 },
  { epoch: 13, accuracy: 0.8512, loss: 0.3349 },
  { epoch: 14, accuracy: 0.8500, loss: 0.3316 },
  { epoch: 15, accuracy: 0.8500, loss: 0.3305 },
  { epoch: 16, accuracy: 0.8562, loss: 0.3290 },
  { epoch: 17, accuracy: 0.8544, loss: 0.3276 },
  { epoch: 18, accuracy: 0.8550, loss: 0.3262 },
  { epoch: 19, accuracy: 0.8537, loss: 0.3252 },
  { epoch: 20, accuracy: 0.8531, loss: 0.3242 },
  { epoch: 21, accuracy: 0.8575, loss: 0.3242 },
  { epoch: 22, accuracy: 0.8512, loss: 0.3245 },
  { epoch: 23, accuracy: 0.8550, loss: 0.3223 },
  { epoch: 24, accuracy: 0.8594, loss: 0.3218 },
  { epoch: 25, accuracy: 0.8556, loss: 0.3208 },
  { epoch: 26, accuracy: 0.8550, loss: 0.3203 },
  { epoch: 27, accuracy: 0.8594, loss: 0.3196 },
  { epoch: 28, accuracy: 0.8569, loss: 0.3195 },
  { epoch: 29, accuracy: 0.8581, loss: 0.3189 },
  { epoch: 30, accuracy: 0.8600, loss: 0.3197 },
];

export const MODEL_BENCHMARK_METRICS = {
  datasetName: 'upi_fraud_dataset_2000_v2.csv',
  totalRows: 2000,
  trainRows: 1600,
  testRows: 400,
  splitRatio: '80 / 20',
  randomState: 42,
  ann: {
    name: 'Artificial Neural Network (Keras)',
    notebookFile: 'ANN_DL_prj_61a82bde.ipynb',
    testAccuracy: 83.25,
    finalTrainAccuracy: 86.0,
    finalTrainLoss: 0.3197,
    epochs: 30,
    batchSize: 32,
    optimizer: 'Adam',
    lossFn: 'binary_crossentropy',
    encoding: 'get_dummies(drop_first=True) · 9 features',
    scaling: 'StandardScaler',
    architecture: 'Input(9) → Dense(16, ReLU) → Dense(8, ReLU) → Dense(1, Sigmoid)',
    sampleProb: 0.9987213,
  },
  rf: {
    name: 'Random Forest Classifier (scikit-learn)',
    notebookFile: 'PRJ_RF_UPI_50a30f40.ipynb',
    testAccuracy: 81.0,
    nEstimators: 100,
    stratified: true,
    encoding: 'get_dummies(columns=["transaction_type"]) · 10 features',
    scaling: 'None (tree-invariant)',
    architecture: '100 Decision Trees (Gini impurity, bootstrap sampling)',
    sampleVerdict: 'ALERT! Fraud Transaction Detected',
  },
};

export const NOTEBOOK_PRESETS: NotebookPreset[] = [
  {
    id: 'ann-sample',
    label: 'ANN Notebook Case',
    subtitle: '₹3,000 UPI · 02:00 · 3 failed attempts',
    input: {
      amount: 3000.0,
      transaction_type: 'UPI',
      hour: 2,
      location_match: 0,
      device_match: 0,
      daily_transactions: 12,
      failed_attempts: 3,
      new_beneficiary: 1,
    },
  },
  {
    id: 'rf-sample',
    label: 'RF Notebook Case',
    subtitle: '₹25,000 UPI · 02:00 · 3 failed attempts',
    input: {
      amount: 25000,
      transaction_type: 'UPI',
      hour: 2,
      location_match: 0,
      device_match: 0,
      daily_transactions: 12,
      failed_attempts: 3,
      new_beneficiary: 1,
    },
  },
  {
    id: 'row-4',
    label: 'Dataset Row #4 (Normal)',
    subtitle: '₹397.92 P2M · 09:00 · Location & device match',
    input: {
      amount: 397.92,
      transaction_type: 'P2M',
      hour: 9,
      location_match: 1,
      device_match: 1,
      daily_transactions: 4,
      failed_attempts: 0,
      new_beneficiary: 1,
    },
  },
  {
    id: 'row-3',
    label: 'Dataset Row #3 (Fraud)',
    subtitle: '₹12,120.92 UPI · 14:00 · High amount anomaly',
    input: {
      amount: 12120.92,
      transaction_type: 'UPI',
      hour: 14,
      location_match: 1,
      device_match: 1,
      daily_transactions: 4,
      failed_attempts: 0,
      new_beneficiary: 0,
    },
  },
];

// First 5 rows are verbatim from PRJ_RF_UPI_50a30f40.ipynb data.head() output.
// Remaining rows reflect the documented upi_fraud_dataset_2000_v2.csv schema and patterns.
export const DATASET_SAMPLE_ROWS: DatasetRow[] = [
  {
    transaction_id: 1,
    amount: 892.39,
    transaction_type: 'P2P',
    hour: 5,
    location_match: 0,
    device_match: 1,
    daily_transactions: 3,
    failed_attempts: 0,
    new_beneficiary: 0,
    is_fraud: 0,
    source_note: 'Notebook head() row 0',
  },
  {
    transaction_id: 2,
    amount: 1804.8,
    transaction_type: 'UPI',
    hour: 1,
    location_match: 1,
    device_match: 1,
    daily_transactions: 3,
    failed_attempts: 4,
    new_beneficiary: 1,
    is_fraud: 1,
    source_note: 'Notebook head() row 1',
  },
  {
    transaction_id: 3,
    amount: 12120.92,
    transaction_type: 'UPI',
    hour: 14,
    location_match: 1,
    device_match: 1,
    daily_transactions: 4,
    failed_attempts: 0,
    new_beneficiary: 0,
    is_fraud: 1,
    source_note: 'Notebook head() row 2',
  },
  {
    transaction_id: 4,
    amount: 397.92,
    transaction_type: 'P2M',
    hour: 9,
    location_match: 1,
    device_match: 1,
    daily_transactions: 4,
    failed_attempts: 0,
    new_beneficiary: 1,
    is_fraud: 0,
    source_note: 'Notebook head() row 3',
  },
  {
    transaction_id: 5,
    amount: 2188.2,
    transaction_type: 'P2M',
    hour: 20,
    location_match: 0,
    device_match: 1,
    daily_transactions: 1,
    failed_attempts: 1,
    new_beneficiary: 0,
    is_fraud: 1,
    source_note: 'Notebook head() row 4',
  },
  {
    transaction_id: 6,
    amount: 540.0,
    transaction_type: 'P2P',
    hour: 11,
    location_match: 1,
    device_match: 1,
    daily_transactions: 2,
    failed_attempts: 0,
    new_beneficiary: 0,
    is_fraud: 0,
    source_note: 'Routine daytime transfer',
  },
  {
    transaction_id: 7,
    amount: 18450.0,
    transaction_type: 'UPI',
    hour: 3,
    location_match: 0,
    device_match: 0,
    daily_transactions: 9,
    failed_attempts: 2,
    new_beneficiary: 1,
    is_fraud: 1,
    source_note: 'Nocturnal device & location mismatch',
  },
  {
    transaction_id: 8,
    amount: 145.5,
    transaction_type: 'P2M',
    hour: 18,
    location_match: 1,
    device_match: 1,
    daily_transactions: 5,
    failed_attempts: 0,
    new_beneficiary: 0,
    is_fraud: 0,
    source_note: 'Evening merchant payment',
  },
  {
    transaction_id: 9,
    amount: 7620.0,
    transaction_type: 'P2P',
    hour: 23,
    location_match: 0,
    device_match: 0,
    daily_transactions: 8,
    failed_attempts: 3,
    new_beneficiary: 1,
    is_fraud: 1,
    source_note: 'Multiple PIN failures & new payee',
  },
  {
    transaction_id: 10,
    amount: 1299.0,
    transaction_type: 'UPI',
    hour: 16,
    location_match: 1,
    device_match: 1,
    daily_transactions: 3,
    failed_attempts: 0,
    new_beneficiary: 0,
    is_fraud: 0,
    source_note: 'Standard afternoon UPI',
  },
  {
    transaction_id: 11,
    amount: 14900.0,
    transaction_type: 'P2M',
    hour: 1,
    location_match: 0,
    device_match: 1,
    daily_transactions: 11,
    failed_attempts: 2,
    new_beneficiary: 1,
    is_fraud: 1,
    source_note: 'High velocity late-night checkout',
  },
  {
    transaction_id: 12,
    amount: 650.25,
    transaction_type: 'P2P',
    hour: 13,
    location_match: 1,
    device_match: 1,
    daily_transactions: 1,
    failed_attempts: 0,
    new_beneficiary: 1,
    is_fraud: 0,
    source_note: 'Trusted device new contact',
  },
  {
    transaction_id: 13,
    amount: 4250.0,
    transaction_type: 'UPI',
    hour: 4,
    location_match: 0,
    device_match: 0,
    daily_transactions: 7,
    failed_attempts: 3,
    new_beneficiary: 1,
    is_fraud: 1,
    source_note: 'Unrecognized device at 04:00',
  },
  {
    transaction_id: 14,
    amount: 299.0,
    transaction_type: 'P2M',
    hour: 10,
    location_match: 1,
    device_match: 1,
    daily_transactions: 2,
    failed_attempts: 0,
    new_beneficiary: 0,
    is_fraud: 0,
    source_note: 'Morning merchant scan',
  },
  {
    transaction_id: 15,
    amount: 22400.0,
    transaction_type: 'UPI',
    hour: 15,
    location_match: 1,
    device_match: 0,
    daily_transactions: 10,
    failed_attempts: 1,
    new_beneficiary: 1,
    is_fraud: 1,
    source_note: 'High-ticket device switch',
  },
];

export const ANN_NOTEBOOK_CELLS: NotebookCell[] = [
  {
    step: '01. Imports',
    title: 'Load TensorFlow, Keras & scikit-learn utilities',
    code: `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense`,
  },
  {
    step: '02. Preprocessing',
    title: 'One-hot encode categoricals (drop_first=True) & standardize',
    code: `df = pd.read_csv('upi_fraud_dataset_2000_v2.csv')
X = df.drop(columns=['transaction_id', 'is_fraud'])
X = pd.get_dummies(X, drop_first=True)
y = df['is_fraud']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)`,
  },
  {
    step: '03. Network Architecture',
    title: 'Sequential 3-layer MLP with ReLU & Sigmoid output',
    code: `model = Sequential([
    Dense(16, activation='relu', input_shape=(X_train_scaled.shape[1],)),
    Dense(8, activation='relu'),
    Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
model.fit(X_train_scaled, y_train, epochs=30, batch_size=32, verbose=1)`,
    output: `Epoch 1/30  — accuracy: 0.6106 - loss: 0.6870
Epoch 10/30 — accuracy: 0.8462 - loss: 0.3413
Epoch 20/30 — accuracy: 0.8531 - loss: 0.3242
Epoch 30/30 — accuracy: 0.8600 - loss: 0.3197`,
  },
  {
    step: '04. Evaluation & Inference',
    title: 'Evaluate 400 test transactions & predict new UPI sample',
    code: `y_pred = (model.predict(X_test_scaled) > 0.5).astype(int).flatten()
accuracy = accuracy_score(y_test, y_pred)
print(f"ANN Test Accuracy: {accuracy * 100:.2f}%")

new_transaction_raw = pd.DataFrame([{
    'amount': 3000.0, 'transaction_type': 'UPI', 'hour': 2,
    'location_match': 0, 'device_match': 0, 'daily_transactions': 12,
    'failed_attempts': 3, 'new_beneficiary': 1
}])
new_transaction = pd.get_dummies(new_transaction_raw).reindex(columns=X.columns, fill_value=0)
fraud_prob = model.predict(scaler.transform(new_transaction))[0][0]
print(fraud_prob)`,
    output: `ANN Test Accuracy: 83.25%
0.9987213
Result: FRAUD TRANSACTION`,
  },
];

export const RF_NOTEBOOK_CELLS: NotebookCell[] = [
  {
    step: '01. Imports & Load',
    title: 'Import RandomForestClassifier & load 2,000-row dataset',
    code: `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

data = pd.read_csv("upi_fraud_dataset_2000_v2.csv")
print(data.head())

X = data.drop(["transaction_id", "is_fraud"], axis=1)
y = data["is_fraud"]`,
    output: `   transaction_id    amount transaction_type  hour  location_match  device_match  daily_transactions  failed_attempts  new_beneficiary  is_fraud
0               1    892.39              P2P     5               0             1                   3                0                0         0
1               2   1804.80              UPI     1               1             1                   3                4                1         1
2               3  12120.92              UPI    14               1             1                   4                0                0         1
3               4    397.92              P2M     9               1             1                   4                0                1         0
4               5   2188.20              P2M    20               0             1                   1                1                0         1`,
  },
  {
    step: '02. Stratified Split',
    title: 'Full one-hot encoding & stratified 80/20 split',
    code: `X = pd.get_dummies(X, columns=["transaction_type"])

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)`,
  },
  {
    step: '03. Ensemble Training',
    title: 'Fit 100 Decision Trees without feature scaling',
    code: `model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)
model.fit(X_train, y_train)`,
    output: `RandomForestClassifier(random_state=42)`,
  },
  {
    step: '04. Evaluation & Inference',
    title: 'Test set accuracy & single-transaction classification',
    code: `prediction = model.predict(X_test)
accuracy = accuracy_score(y_test, prediction)
print("Model Accuracy:", accuracy * 100, "%")

new_transaction = pd.DataFrame([{
    "amount": 25000, "transaction_type": "UPI", "hour": 2,
    "location_match": 0, "device_match": 0, "daily_transactions": 12,
    "failed_attempts": 3, "new_beneficiary": 1
}])
new_transaction = pd.get_dummies(new_transaction, columns=["transaction_type"]).reindex(columns=X.columns, fill_value=0)
result = model.predict(new_transaction)`,
    output: `Model Accuracy: 81.0 %
ALERT! Fraud Transaction Detected`,
  },
];
