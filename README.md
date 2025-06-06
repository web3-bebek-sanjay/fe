# Front-End Web3 Project

## Overview

This repository contains the front-end implementation for a Web3 application. It provides a user interface to interact with blockchain functionalities, smart contracts, and decentralized applications.

## Features

- Wallet integration and connection
- Transaction management
- Smart contract interaction
- Decentralized authentication
- Responsive design for multiple devices

## Technologies

- React.js
- Web3.js/Ethers.js
- MetaMask integration
- IPFS for decentralized storage
- Responsive UI components

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask extension installed in your browser

### Installation

```bash
# Clone the repository
git clone https://github.com/web3-bebek-sanjay/fe.git

# Navigate to the project directory
cd fe

# Install dependencies
npm install

# Start the development server
npm start
```

## Usage

1. Connect your wallet using the "Connect Wallet" button
2. Interact with the available features
3. Sign and confirm transactions through your wallet

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory and configure your settings:

```bash
# Blockchain network settings
REACT_APP_RPC_URL=https://your-rpc-endpoint
REACT_APP_CHAIN_ID=1
REACT_APP_CONTRACT_ADDRESS=0x...

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Supabase Setup

This project uses Supabase for file storage. To set up Supabase:

1. **Create a Supabase Project**

   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key to the environment variables

2. **Install Supabase Client**

   ```bash
   npm install @supabase/supabase-js
   ```

3. **Create Storage Bucket**

   - In your Supabase dashboard, go to Storage
   - Create a new bucket named `ip-files`
   - Set the bucket to public

4. **Storage Policies**
   Add these RLS policies in the Supabase dashboard:

   **Policy for SELECT (viewing files):**

   ```sql
   CREATE POLICY "Public Access" ON storage.objects
   FOR SELECT USING (bucket_id = 'ip-files');
   ```

   **Policy for INSERT (uploading files):**

   ```sql
   CREATE POLICY "Public Upload" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'ip-files');
   ```

   **Policy for DELETE (deleting files):**

   ```sql
   CREATE POLICY "Public Delete" ON storage.objects
   FOR DELETE USING (bucket_id = 'ip-files');
   ```

### File Upload Features

The application now supports:

- **Image Upload**: Upload images for IP registration and remix creation
- **File Storage**: All files are stored in Supabase with unique filenames
- **Gallery View**: View all uploaded files at `/gallery`
- **File Management**: Delete files when removing from forms

### Accessing the Gallery

After uploading files, you can view them in the gallery:

- Navigate to `/gallery` to see all uploaded remix files
- Click on images to view full-size
- Download files directly from the gallery
- See file metadata like size, upload date, and type

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
