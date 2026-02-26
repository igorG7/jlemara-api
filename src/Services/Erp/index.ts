import erpCustomerService from "./Customer/erp.customer.service";
import erpDevelopmentService from "./Development/erp.development.service";
import erpUnitService from "./Unit/erp.unit.service";


const customer = erpCustomerService
const development = erpDevelopmentService
const unit = erpUnitService



export default {
    customer,
    development,
    unit
}