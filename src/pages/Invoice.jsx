import { useCustomer } from '../context/CustomerContext';
import NavBar from '../components/NavBar';
import logo from '../assets/logo.png';

const Invoice = () => {
  const { customer } = useCustomer();
  console.log(customer);
  
  if (!customer) {
    return (
      <div className='flex justify-center items-center'>
        <h1 className='text-3xl font-bold text-white'>No customer selected</h1>
      </div>
    );
  }

  return (
    <div>
      <div className='m-5'>
        <NavBar />
      </div>
      <div className='mx-5 p-5 border-2 border-white rounded-md'>
        <div className='flex justify-between items-center mb-15'>
          <img src={logo} alt="logo" width={60} height={60}/>
          <h1 className='text-3xl font-bold text-center text-white'>Invoice</h1>
        </div>

        <div className='text-white mb-15'>
          <h1>Boundless</h1>
          <h1>Pulikken tower</h1>
          <h1>Thrissur, Kerala</h1>
        </div>

        <div className='text-white mb-15 flex justify-between'>
          <div>
            <h1 className='font-bold'>Bill To:</h1>
            <h1>{customer.label}</h1>
            <h1>{customer.address}</h1>
            <h1>{customer.number}</h1>
          </div>
          <div>
            <h1>Invoice No:</h1>
            <h1>Invoice Date: </h1>
          </div>
        </div>

        <div className='border-2 border-white rounded-md p-5'>
          
        </div>
      </div>
    </div>
  );
};

export default Invoice;