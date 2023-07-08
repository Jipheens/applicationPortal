import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import '../components/ApplicationForm.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import pesa from "../images/pesa.png"
import technical from "../images/technicalfav.png"



const ApplicationForm = () => {
  const [selectedFile, setSelectedFile] = useState(null);
const [fileType, setFileType] = useState('');

const updateFileType = (event) => {
  const file = event.target.files[0];
  setSelectedFile(file);

  // Update the file type
  const reader = new FileReader();
  reader.onloadend = () => {
    const arr = (new Uint8Array(reader.result)).subarray(0, 4);
    let header = '';
    for (let i = 0; i < arr.length; i++) {
      header += arr[i].toString(16);
    }
    switch (header) {
      case '89504e47':
        setFileType('image/png');
        break;
      case '47494638':
        setFileType('image/gif');
        break;
      case 'ffd8ffe0':
      case 'ffd8ffe1':
      case 'ffd8ffe2':
        setFileType('image/jpeg');
        break;
      case '504b34':
        setFileType('application/zip');
        break;
      // Add more cases for other file types if needed
      default:
        setFileType('');
    }
  };
  reader.readAsArrayBuffer(file);
};

  
  const [activeTab, setActiveTab] = useState('financial');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  
  const handleAddAttachment = (type) => {
    if (type === 'financial') {
      handleAddFinancialAttachment();
    } else if (type === 'technical') {
      handleAddTechnicalAttachment();
    }
  };

  
  const [applications, setApplications] = useState([]);
  const [formData, setFormData] = useState({
    supplierCode: '',
    supplierName: '',
    rfqCode: '',
    rfqName: '',
    items: [
      {
        itemName: '',
        unitPricePerItem: 0,
        unitOfMeasure: '',
        taxName: '',
        taxRate: 0,
        quantity: 0,
        description: ''
      }
    ],
    financialAttachments: [
      {
        file: null,
        filetype: '',
        filename: ''
      }
    ],
    technicalAttachments: [
      {
        file: null,
        filetype: '',
        filename: ''
      }
    ]
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    
    try {
      const response = await axios.get(
        'http://192.168.100.230:9090/api/v1/RFQsApplication/all'
      );
      setApplications(response.data);
    } catch (error) {
      console.error(error);
    }

  };
  

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(formData);

    try {
      const response = await axios.post(
        'http://192.168.100.230:9090/api/v1/RFQsApplication/create',
        formData
      );

      // Upload financial attachments
      if (formData.financialAttachments.length > 0) {
        const financialUploadPromises = formData.financialAttachments.map(async (attachment) => {
          const formData = new FormData();
          formData.append('file', attachment.file);
          formData.append('filetype', attachment.filetype);
          formData.append('filename', attachment.filename);

          await axios.post('http://192.168.0.112:9090/api/v1/rfq/uploadFinancialAttachment', formData);
        });
        await Promise.all(financialUploadPromises);
      }

      // Upload technical attachments
      if (formData.technicalAttachments.length > 0) {
        const technicalUploadPromises = formData.technicalAttachments.map(async (attachment) => {
          const formData = new FormData();
          formData.append('file', attachment.file);
          formData.append('filetype', attachment.filetype);
          formData.append('filename', attachment.filename);

          await axios.post('http://192.168.0.112:9090/api/v1/rfq/uploadTechnicalAttachment', formData);
        });
        await Promise.all(technicalUploadPromises);
      }

      setFormData({
        supplierCode: '',
        supplierName: '',
        rfqCode: '',
        rfqName: '',
        items: [
          {
            itemName: '',
            unitPricePerItem: 0,
            unitOfMeasure: '',
            taxName: '',
            taxRate: 0,
            quantity: 0,
            description: ''
          }
        ],
        financialAttachments: [
          {
            file: null,
            filetype: '',
            filename: ''
          }
        ],
        technicalAttachments: [
          {
            file: null,
            filetype: '',
            filename: ''
          }
        ]
      });
      fetchApplications(); // Fetch applications again to update the table
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (event, index) => {
    const { name, value } = event.target;

    if (name.startsWith('items[')) {
      const updatedItems = [...formData.items];
      const property = name.split('.')[1];
      updatedItems[index] = {
        ...updatedItems[index],
        [property]: value
      };
      setFormData({
        ...formData,
        items: updatedItems
      });
    } else if (name.startsWith('financialAttachments[')) {
      const updatedAttachments = [...formData.financialAttachments];
      const property = name.split('.')[1];
      updatedAttachments[index] = {
        ...updatedAttachments[index],
        [property]: value
      };
      setFormData({
        ...formData,
        financialAttachments: updatedAttachments
      });
    } else if (name.startsWith('technicalAttachments[')) {
      const updatedAttachments = [...formData.technicalAttachments];
      const property = name.split('.')[1];
      updatedAttachments[index] = {
        ...updatedAttachments[index],
        [property]: value
      };
      setFormData({
        ...formData,
        technicalAttachments: updatedAttachments
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleFileChange = (event, type, index) => {
    const attachments = type === 'financial' ? formData.financialAttachments : formData.technicalAttachments;
    const updatedAttachments = [...attachments];
    const file = event.target.files[0];
  
    // Update the file type
    const reader = new FileReader();
    reader.onloadend = () => {
      const arr = (new Uint8Array(reader.result)).subarray(0, 4);
      let header = '';
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }
      switch (header) {
        case '89504e47':
          updatedAttachments[index].filetype = 'image/png';
          break;
        case '47494638':
          updatedAttachments[index].filetype = 'image/gif';
          break;
        case 'ffd8ffe0':
        case 'ffd8ffe1':
        case 'ffd8ffe2':
          updatedAttachments[index].filetype = 'image/jpeg';
          break;
        case '504b34':
          updatedAttachments[index].filetype = 'application/zip';
          break;
        // Add more cases for other file types if needed
        default:
          updatedAttachments[index].filetype = '';
      }
      setFormData((prevState) => {
        const updatedData = { ...prevState };
        if (type === 'financial') {
          updatedData.financialAttachments = updatedAttachments;
        } else {
          updatedData.technicalAttachments = updatedAttachments;
        }
        return updatedData;
      });
    };
    reader.readAsArrayBuffer(file);
  
    updatedAttachments[index].file = file;
    if (file) {
      updatedAttachments[index].filename = file.name;
    } else {
      updatedAttachments[index].filename = '';
    }
  
    if (type === 'financial') {
      setFormData((prevState) => {
        const updatedData = { ...prevState };
        updatedData.financialAttachments = updatedAttachments;
        return updatedData;
      });
    } else {
      setFormData((prevState) => {
        const updatedData = { ...prevState };
        updatedData.technicalAttachments = updatedAttachments;
        return updatedData;
      });
    }
  };
  

  const handleAddItem = () => {
    setFormData((prevState) => ({
      ...prevState,
      items: [
        ...prevState.items,
        {
          itemName: '',
          unitPricePerItem: 0,
          unitOfMeasure: '',
          taxName: '',
          taxRate: 0,
          quantity: 0,
          description: ''
        }
      ]
    }));
  };

  const handleAddFinancialAttachment = () => {
    setFormData((prevState) => ({
      ...prevState,
      financialAttachments: [
        ...prevState.financialAttachments,
        {
          file: null,
          filetype: '',
          filename: ''
        }
      ]
    }));
  };

  const handleAddTechnicalAttachment = () => {
    setFormData((prevState) => ({
      ...prevState,
      technicalAttachments: [
        ...prevState.technicalAttachments,
        {
          file: null,
          filetype: '',
          filename: ''
        }
      ]
    }));
  };

  const calculateItemSubTotal = (item) => {
    return item.unitPricePerItem * item.quantity;
  };

  const calculateItemVatTotal = (item) => {
    return calculateItemSubTotal(item) * (item.taxRate / 100);
  };

  const calculateItemGrantTotal = (item) => {
    return calculateItemSubTotal(item) + calculateItemVatTotal(item);
  };

  const calculateSubTotalAmount = () => {
    return formData.items.reduce((total, item) => total + calculateItemSubTotal(item), 0);
  };

  const calculateVatTotalAmount = () => {
    return formData.items.reduce((total, item) => total + calculateItemVatTotal(item), 0);
  };

  const calculateGrantTotal = () => {
    return formData.items.reduce((total, item) => total + calculateItemGrantTotal(item), 0);
  };

  const calculateItemSubTotalAmount = () => {
    return formData.applications.reduce((total, application) => total + calculateSubTotalAmount(application.items), 0);
  };
  
  const calculateItemVatTotalAmount = () => {
    return formData.applications.reduce((total, application) => total + calculateVatTotalAmount(application.items), 0);
  };
  
  const calculateItemGrantTotalAmount = () => {
    return formData.applications.reduce((total, application) => total + calculateGrantTotal(application.items), 0);
  };
  const handleDeleteAttachment = (index, type) => {
    if (type === 'financial') {
      handleDeleteFinancialAttachment(index);
    } else if (type === 'technical') {
      handleDeleteTechnicalAttachment(index);
    }
  };

  const handleDeleteFinancialAttachment = (index) => {
    const updatedAttachments = [...formData.financialAttachments];
    updatedAttachments.splice(index, 1);

    setFormData({
      ...formData,
      financialAttachments: updatedAttachments
    });
  };

  const handleDeleteTechnicalAttachment = (index) => {
    const updatedAttachments = [...formData.technicalAttachments];
    updatedAttachments.splice(index, 1);

    setFormData({
      ...formData,
      technicalAttachments: updatedAttachments
    });
  };
  
    

  return (
    <div className='panel panel-heading'>
      <h1>Do your application here</h1>

      <form onSubmit={handleSubmit}>
      <div style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '20px', marginBottom: '20px', marginLeft: '1%', marginRight: '1%' }}>
  <div style={{ display: 'flex', justifyContent: 'center' }}>
  {/* Supplier Code */}
  <label htmlFor="application information :"></label>

  <div style={{ marginRight: '20px' }}>
      <label htmlFor="supplierCode">Supplier Code:</label>
      <input
        type="text"
        id="supplierCode"
        name="supplierCode"
        value={formData.supplierCode}
        onChange={handleChange}
        style={{ width: '120px', marginRight: '10px' }}
        placeholder="Supplier Code"
      />
    </div>

   {/* Supplier Name */}
   <div style={{ marginRight: '20px', marginBottom: '10px' }}>
      <label htmlFor="supplierName">Supplier Name:</label>
      <input
        type="text"
        id="supplierName"
        name="supplierName"
        value={formData.supplierName}
        onChange={handleChange}
        style={{ width: '200px', marginRight: '10px' }}
        placeholder="Supplier Name"
      />
    </div>

    {/* RFQ Code */}
    <div style={{ marginRight: '20px', marginBottom: '10px' }}>
      <label htmlFor="rfqCode">RFQ Code:</label>
      <input
        type="text"
        id="rfqCode"
        name="rfqCode"
        value={formData.rfqCode}
        onChange={handleChange}
        style={{ width: '120px', marginRight: '10px' }}
        placeholder="RFQ Code"
      />
    </div>

    {/* RFQ Name */}
    <div style={{ marginBottom: '10px' }}>
      <label htmlFor="rfqName">RFQ Name:</label>
      <input
        type="text"
        id="rfqName"
        name="rfqName"
        value={formData.rfqName}
        onChange={handleChange}
        style={{ width: '200px', marginRight: '10px' }}
        placeholder="RFQ Name"
      />
    </div>
  </div>
</div>
<br/>
<br/>

{/* ITEMS SECTION */}
<div style={{ border: '1px solid #ccc', borderRadius: '4px', marginBottom: '20px', position: 'relative', marginLeft: '1%', marginRight: '1%' }}>
    <fieldset >
    <legend>Items</legend>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {formData.items.map((item, index) => (
        <div key={index} style={{ marginBottom: '20px' }}>
          <label htmlFor={`items[${index}].itemName`}>Item Name:</label>
          <input
            type="text"
            id={`items[${index}].itemName`}
            name={`items[${index}].itemName`}
            value={item.itemName}
            onChange={(e) => handleChange(e, index)}
            style={{ width: '200px', marginRight: '10px' }}
            placeholder="Item Name"
          />

        <label htmlFor={`items[${index}].unitPricePerItem`}>Unit Price:</label>
        <input
          type="number"
          id={`items[${index}].unitPricePerItem`}
          name={`items[${index}].unitPricePerItem`}
          value={item.unitPricePerItem}
          onChange={(e) => handleChange(e, index)}
          style={{ width: '120px', marginRight: '10px' }}
          placeholder="Unit Price"
        />

        <label htmlFor={`items[${index}].unitOfMeasure`}>Unit of Measure:</label>
        <input
          type="text"
          id={`items[${index}].unitOfMeasure`}
          name={`items[${index}].unitOfMeasure`}
          value={item.unitOfMeasure}
          onChange={(e) => handleChange(e, index)}
          style={{ width: '120px', marginRight: '10px' }}
          placeholder="Unit of Measure"
        />

        <label htmlFor={`items[${index}].taxName`}>Tax Name:</label>
        <input
          type="text"
          id={`items[${index}].taxName`}
          name={`items[${index}].taxName`}
          value={item.taxName}
          onChange={(e) => handleChange(e, index)}
          style={{ width: '120px', marginRight: '10px' }}
          placeholder="Tax Name"
        />

        <label htmlFor={`items[${index}].taxRate`}>Tax Rate:</label>
        <input
          type="number"
          id={`items[${index}].taxRate`}
          name={`items[${index}].taxRate`}
          value={item.taxRate}
          onChange={(e) => handleChange(e, index)}
          style={{ width: '120px', marginRight: '10px' }}
          placeholder="Tax Rate"
        />

        <label htmlFor={`items[${index}].quantity`}>Quantity:</label>
        <input
          type="number"
          id={`items[${index}].quantity`}
          name={`items[${index}].quantity`}
          value={item.quantity}
          onChange={(e) => handleChange(e, index)}
          style={{ width: '120px', marginRight: '10px' }}
          placeholder="Quantity"
        />

        <label htmlFor={`items[${index}].description`}>Description:</label>
        <input
          type="text"
          id={`items[${index}].description`}
          name={`items[${index}].description`}
          value={item.description}
          onChange={(e) => handleChange(e, index)}
          style={{ width: '200px', marginRight: '10px' }}
          placeholder="Description"
        />
<hr />
<br/>
<label htmlFor="subtotalAmount">Subtotal Amount:</label>
          <input
            type="text"
            value={calculateItemSubTotal(item)}
            disabled
            style={{ width: '200px', marginRight: '10px' }}
            placeholder="Subtotal Amount"
          />
          <label htmlFor="vatTotalAmount">VAT Total Amount:</label>
          <input
            type="text"
            value={calculateItemVatTotal(item)}
            disabled
            style={{ width: '200px', marginRight: '10px' }}
            placeholder="VAT Total Amount"
          />
          <label htmlFor="grantTotal">Grant Total:</label>
          <input
            type="text"
            value={calculateItemGrantTotal(item)}
            disabled
            style={{ width: '200px', marginRight: '10px' }}
            placeholder="Grant Total"
          />
        </div>
      ))}
<div style={{ position: 'absolute', top: '-10px', left: '20px' }}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddItem}
        style={{ borderRadius: '20px' }}
      >
        Add Item
      </Button>
    </div>
    </div>
  </fieldset>
</div>

<br/>
<br/>
  {/* Financial Attachments */}

  {/* Tabs */}
  <div  className='tab-container' style={{ display: 'flex', justifyContent: 'center'  }}>
        <div
          className={`tab ${activeTab === 'financial' ? 'active' : ''}`}
          onClick={() => handleTabChange('financial')}
        >
          <img src={pesa} alt="Financial Favicon" className="tab-icon" />
          <span className="tab-title">Financial Attachments</span>
        </div>
        <div
          className={`tab ${activeTab === 'technical' ? 'active' : ''}`}
          onClick={() => handleTabChange('technical')}
        >
          <img src={technical} alt="Technical Favicon" className="tab-icon" />
          <span className="tab-title">Technical Attachments</span>
        </div>
      </div>

      // Financial Attachments
<div className="tab-content">
  {activeTab === 'financial' && (
    <div style={{ padding: '0 1%' }}>
      <div style={{ border: '1px solid #ccc', padding: '10px', position: 'relative' }}>
        <h2 style={{ position: 'absolute', top: '-20px', left: '10px', backgroundColor: '#fff', padding: '0 5px' }}>
          Financial Attachments
        </h2>
        <Fab
          color="primary"
          aria-label="Add Financial Attachment"
          onClick={() => handleAddAttachment('financial')}
          style={{ position: 'absolute', top: '-20px', left: '339px' }}
        >
          <AddIcon />
        </Fab>
        <fieldset>
          <legend>Financial Attachments</legend>
          {formData.financialAttachments.map((attachment, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ marginRight: '10px', width: '25%' }}>
                <div style={{ marginBottom: '5px' }}>
                  <label htmlFor={`financialAttachments[${index}].file`}>File: </label>
                </div>
                <Fab
                  component="label"
                  htmlFor={`financialAttachments[${index}].file`}
                  color="primary"
                  aria-label="Attach File"
                >
                  <AttachFileIcon />
                  <input
                    type="file"
                    id={`financialAttachments[${index}].file`}
                    name={`financialAttachments[${index}].file`}
                    onChange={(e) => handleFileChange(e, 'financial', index)}
                    style={{ display: 'none' }}
                  />
                </Fab>
              </div>
              <div style={{ marginRight: '10px', width: '25%' }}>
                <label htmlFor={`financialAttachments[${index}].filetype`}>File Type:</label>
                <input
                  type="text"
                  id={`financialAttachments[${index}].filetype`}
                  name={`financialAttachments[${index}].filetype`}
                  value={attachment.filetype} // Bind the file type value for each attachment
                  onChange={(e) => handleChange(e, index)}
                />
              </div>
              <div style={{ marginRight: '10px', width: '25%' }}>
                <label htmlFor={`financialAttachments[${index}].filename`}>File Name:</label>
                <input
                  type="text"
                  id={`financialAttachments[${index}].filename`}
                  name={`financialAttachments[${index}].filename`}
                  value={attachment.filename}
                  onChange={(e) => handleChange(e, index)}
                />
              </div>
              <div style={{ marginRight: '10px', width: '25%' }}>
                <div>Delete</div>
                <Fab
                  color="primary"
                  aria-label="Delete Attachment"
                  onClick={() => handleDeleteAttachment(index, 'financial')}
                >
                  <DeleteIcon />
                </Fab>
              </div>
            </div>
          ))}
        </fieldset>
      </div>
    </div>
  )}
</div>

      {/* Technical Attachments */}
      {activeTab === 'technical' && (
        <div style={{ padding: '0 1%' }}>
          <div style={{ border: '1px solid #ccc', padding: '10px', position: 'relative' }}>
            <h2 style={{ position: 'absolute', top: '-20px', left: '10px', backgroundColor: '#fff', padding: '0 5px' }}>
              Technical Attachments
            </h2>
            <Fab
              color="primary"
             aria-label="Add Technical Attachment"
              onClick={() => handleAddAttachment('technical')}
              style={{ position: 'absolute', top: '-20px', left: '344px' }}
            >
              <AddIcon />
            </Fab>
            <fieldset>
              <legend>Technical Attachments</legend>
              {formData.technicalAttachments.map((attachment, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ marginRight: '10px', width: '25%' }}>
                    <div style={{ marginBottom: '5px' }}>File:</div>
                    <Fab
                      component="label"
                      htmlFor={`technicalAttachments[${index}].file`}
                      color="primary"
                      aria-label="Attach File"
                    >
                      <AttachFileIcon />
                      <input
                        type="file"
                        id={`technicalAttachments[${index}].file`}
                        name={`technicalAttachments[${index}].file`}
                        onChange={(e) => handleFileChange(e, 'technical', index)}
                        style={{ display: 'none' }}
                      />
                    </Fab>
                  </div>
                  <div style={{ marginRight: '10px', width: '25%' }}>
                    <div>File Type:</div>
                    <input
                      type="text"
                      id={`technicalAttachments[${index}].filetype`}
                      name={`technicalAttachments[${index}].filetype`}
                      value={attachment.filetype}
                      onChange={(e) => handleChange(e, index)}
                    />
                  </div>
                  <div style={{ marginRight: '10px', width: '25%' }}>
                    <div>File Name:</div>
                    <input
                      type="text"
                      id={`technicalAttachments[${index}].filename`}
                      name={`technicalAttachments[${index}].filename`}
                      value={attachment.filename}
                      onChange={(e) => handleChange(e, index)}
                    />
                  </div>
                  <div style={{ marginRight: '10px', width: '25%' }}>
                    <div>Delete</div>
                    <Fab
                      color="primary"
                      aria-label="Delete Attachment"
                      onClick={() => handleDeleteAttachment(index, 'technical')}
                    >
                      <DeleteIcon />
                    </Fab>
                  </div>
                </div>
              ))}
            </fieldset>
          </div>
        </div>
      )}

  {/* Summary */}
  <fieldset>
    <legend>Summary</legend>
    <p>Subtotal Amount: {calculateSubTotalAmount()}</p>
    <p>VAT Total Amount: {calculateVatTotalAmount()}</p>
    <p>Grant Total: {calculateGrantTotal()}</p>
  </fieldset>

  <button type="submit">Submit</button>
</form>


<table>
        <thead>
            <tr>
            <th>Supplier Code</th>
            <th>Supplier Name</th>
            <th>RFQ Code</th>
            <th>RFQ Name</th>
            <th>Item Name</th>
            <th>Unit Price</th>
            <th>Unit of Measure</th>
            <th>Tax Name</th>
            <th>Tax Rate</th>
            <th>Quantity</th>
            <th>Description</th>
            <th>Subtotal Amount</th>
            <th>VAT Total Amount</th>
            <th>Grant Total</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) =>
            application.items.map((item, index) => (
              <tr key={`${application.id}-${index}`}>
                {index === 0 && (
                  <>
                    <td rowSpan={application.items.length}>{application.supplierCode}</td>
                    <td rowSpan={application.items.length}>{application.supplierName}</td>
                    <td rowSpan={application.items.length}>{application.rfqCode}</td>
                    <td rowSpan={application.items.length}>{application.rfqName}</td>
                  </>
                )}
                <td>{item.itemName}</td>
                <td>{item.unitPricePerItem}</td>
                <td>{item.unitOfMeasure}</td>
                <td>{item.taxName}</td>
                <td>{item.taxRate}</td>
                <td>{item.quantity}</td>
                <td>{item.description}</td>
                <td>{calculateItemSubTotal(item)}</td>
                <td>{calculateItemVatTotal(item)}</td>
               <td>{calculateItemGrantTotal(item)}</td>
              {/* Render additional cells for additional columns */}
              </tr>
            ))
          )}
        </tbody>
      </table>

    </div>
  );
};

export default ApplicationForm;
